# Threading & Concurrency Guide — Making performant Google Ads integrations

This document describes strategies, patterns, and concrete examples for adding concurrency and threading to services that interact with Google Ads APIs (or similar external advertising APIs). It assumes you want safe, high-throughput integrations that respect quotas and remain observable.

Contents
- Quick repo note
- Key principles
- Concurrency patterns
- Language-specific examples (Node.js, Python, Go, Java)
- Testing, observability, and safety checklist
- Next steps

---

## Quick repo note
I couldn't run an automated scan in this environment, so I didn't modify your code. Before applying any changes, run a quick search for long-running synchronous loops, per-request client creation, or unbounded concurrency in your services. Look for repeated `new HttpClient()` / `requests.Session()` creation, or many simultaneous `await`/`then` calls without bounding.

---

## Key principles for performant Google Ads integrations

1. Respect quotas and rate limits
   - The most important constraint is the API's per-customer and per-developer quota. Concurrency must be bounded and rate-limited.

2. Reuse network resources
   - Reuse HTTP clients to get connection pooling and keep-alive. Creating a new client per request dramatically increases latency and resource usage.

3. Prefer batching
   - When the API supports batched operations, group requests to reduce overhead and improve throughput.

4. Bounded concurrency, not unbounded parallelism
   - Use worker pools, semaphores, or executors to cap concurrent outbound requests.

5. Retries with exponential backoff and jitter
   - Retry transient errors (5xx, 429) with exponential backoff and randomized jitter. Honor `Retry-After` headers.

6. Observability and graceful shutdown
   - Instrument requests (latency, success/error counts). On shutdown, drain queues and finish in-flight work.

7. Per-customer limits
   - Apply per-customer or per-account concurrency limits to avoid hot-spotting and exceeding customer-specific quotas.

---

## Concurrency patterns

- Worker pool (bounded concurrency): A fixed number of workers consuming a job queue.
- Token-bucket / rate limiter: Ensures a steady request rate regardless of bursts.
- Batching window: Aggregate tasks for N milliseconds and send a single batch request.
- Circuit breaker: Fast-fail when downstream errors spike, with periodic retries to probe recovery.
- Priority queue: Prioritize time-sensitive operations (e.g., real-time bidding) over low-priority background work.

---

## Node.js (async/await) — bounded concurrency pool + axios reuse

Example: a simple promise pool pattern. Use a single `axios` instance with connection pooling. Tune `concurrency` and combine with a rate limiter if needed.

```lite-kit/docs/threading_google_ads.md#L1-120
// Node.js: promisePool + shared axios client
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent'); // optional

// Create a single axios instance to reuse connections
const client = axios.create({
  baseURL: 'https://google-ads-api.example.com',
  timeout: 30000,
  // agent: new HttpsProxyAgent(process.env.HTTPS_PROXY) // if needed
});

// Simple bounded concurrency helper (p-limit style)
function promisePool(taskFactories, concurrency = 10) {
  let i = 0;
  const results = new Array(taskFactories.length);
  const executing = new Set();

  return new Promise((resolve, reject) => {
    function enqueue() {
      if (i === taskFactories.length && executing.size === 0) {
        resolve(Promise.all(results));
        return;
      }
      while (i < taskFactories.length && executing.size < concurrency) {
        const idx = i++;
        const p = Promise.resolve().then(() => taskFactories[idx]());
        results[idx] = p;
        executing.add(p);
        p.then(() => executing.delete(p)).catch(err => {
          executing.delete(p);
          // Optionally stop the whole pool on fatal error:
          // reject(err);
        });
      }
      // Wait a tick and try again when some tasks complete
      if (executing.size > 0) {
        Promise.race(executing).then(enqueue).catch(enqueue);
      }
    }
    enqueue();
  });
}

// Example task factory that calls the API
function makeAdCallFactory(payload) {
  return async () => {
    // implement retries/backoff as needed
    const res = await client.post('/v1/bids', payload);
    return res.data;
  };
}
```

Notes:
- Add a token bucket or `bottleneck` library for rate-limiting if you must adhere to requests/sec.
- Use idempotency keys when retrying mutating operations.

---

## Python — asyncio + aiohttp and sync ThreadPoolExecutor examples

Prefer `asyncio` + `aiohttp` for high concurrency; fallback to `requests` + `ThreadPoolExecutor` for legacy sync code.

```lite-kit/docs/threading_google_ads.md#L121-300
# Python asyncio bounded semaphore + aiohttp
import asyncio
import aiohttp
import random

async def fetch_ad(session, payload, sem):
    async with sem:
        for attempt in range(5):
            try:
                async with session.post('https://google-ads-api.example.com/v1/bids', json=payload) as resp:
                    if resp.status in (429, 503, 500):
                        # read Retry-After header when present
                        retry_after = resp.headers.get('Retry-After')
                        delay = float(retry_after) if retry_after else (2 ** attempt) + random.random()
                        await asyncio.sleep(delay)
                        continue
                    resp.raise_for_status()
                    return await resp.json()
            except aiohttp.ClientError:
                await asyncio.sleep((2 ** attempt) + random.random())
        raise RuntimeError('Max retries exceeded')

async def run_batch(payloads, concurrency=20):
    sem = asyncio.Semaphore(concurrency)
    timeout = aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        tasks = [asyncio.create_task(fetch_ad(session, p, sem)) for p in payloads]
        return await asyncio.gather(*tasks, return_exceptions=False)

# Sync example using requests + ThreadPoolExecutor
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

def sync_call(session, payload):
    resp = session.post('https://google-ads-api.example.com/v1/bids', json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()

def run_sync_batch(payloads, max_workers=20):
    with requests.Session() as s:
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = [ex.submit(sync_call, s, p) for p in payloads]
            return [f.result() for f in as_completed(futures)]
```

Notes:
- Avoid creating a new `aiohttp.ClientSession` or `requests.Session` per request; create one per process or service component.
- Use `asyncio` for large I/O-bound workloads.

---

## Go — goroutines with a bounded worker pool and shared http.Client

Go goroutines are lightweight, but bound outbound concurrency to avoid exceeding API quotas.

```lite-kit/docs/threading_google_ads.md#L301-600
// Go: bounded worker pool with shared http.Client
package ads

import (
  "bytes"
  "context"
  "io/ioutil"
  "net/http"
  "sync"
  "time"
)

type Job struct {
  Payload []byte
  RespCh  chan<- []byte
  ErrCh   chan<- error
}

func StartWorkerPool(ctx context.Context, numWorkers int, jobs <-chan Job) {
  client := &http.Client{
    Timeout: 30 * time.Second,
    // Use Transport with tuned MaxIdleConns, IdleConnTimeout for production
  }

  var wg sync.WaitGroup
  for i := 0; i < numWorkers; i++ {
    wg.Add(1)
    go func() {
      defer wg.Done()
      for {
        select {
        case <-ctx.Done():
          return
        case job, ok := <-jobs:
          if !ok {
            return
          }
          req, _ := http.NewRequest("POST", "https://google-ads-api.example.com/v1/bids", bytes.NewReader(job.Payload))
          req.Header.Set("Content-Type", "application/json")
          resp, err := client.Do(req)
          if err != nil {
            job.ErrCh <- err
            continue
          }
          body, _ := ioutil.ReadAll(resp.Body)
          resp.Body.Close()
          job.RespCh <- body
        }
      }
    }()
  }
  // Optionally wait in another goroutine and close channels when done
  go func() {
    wg.Wait()
    // cleanup if needed
  }()
}
```

Notes:
- Tune `http.Transport` settings: `MaxIdleConns`, `MaxIdleConnsPerHost`, `IdleConnTimeout`.
- Combine worker pool with rate limiting (e.g., `golang.org/x/time/rate`).

---

## Java — ExecutorService + HttpClient with CompletableFuture

Use a configured `HttpClient` (Java 11+) and an `ExecutorService` to bound concurrency.

```lite-kit/docs/threading_google_ads.md#L601-900
// Java: ExecutorService with shared java.net.http.HttpClient
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.*;

public class GoogleAdsClient {
  private final HttpClient httpClient;
  private final ExecutorService executor;

  public GoogleAdsClient(int concurrency) {
    this.executor = Executors.newFixedThreadPool(concurrency);
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .executor(executor)
        .build();
  }

  public CompletableFuture<String> sendAsync(String jsonPayload) {
    var req = HttpRequest.newBuilder()
        .uri(URI.create("https://google-ads-api.example.com/v1/bids"))
        .timeout(Duration.ofSeconds(30))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
        .build();
    return httpClient.sendAsync(req, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body);
  }

  public void shutdown() {
    executor.shutdown();
    try {
      if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
        executor.shutdownNow();
      }
    } catch (InterruptedException e) {
      executor.shutdownNow();
      Thread.currentThread().interrupt();
    }
  }
}
```

Notes:
- Use bounded executor pools and tune pool size to the API quotas and your host's capacity.
- Combine with a request-rate limiter for robust quota handling.

---

## Testing, observability, and safety checklist

- Load testing: simulate realistic traffic with quotas applied. Include bursts.
- Metrics: requests/sec, success/error counts, latency percentiles (P50, P95, P99), retry counts.
- Tracing: instrument with OpenTelemetry or similar to trace retries and downstream latencies.
- Logging: include request IDs, customer/account IDs, and idempotency keys for debugging.
- Graceful shutdown: stop accepting new work, drain queues, wait for in-flight requests (with timeout), then exit.
- Chaos testing: inject failures and latency to validate retries, backoff, and circuit breakers.
- Security: never log secrets or full payloads in production logs.

---

## Practical configuration suggestions

- Concurrency: start with a conservative value (10–50 depending on CPU/memory and quota) and increase while monitoring.
- Retries: use max 3–5 retries with exponential backoff, cap backoff, and add jitter.
- Connection pooling: set keep-alive and appropriate max idle connections per host.
- Per-customer throttling: maintain per-customer semaphores or token buckets when operating on many customer accounts.

---

## Next steps I can take for you
- Inspect specific service files and add a concrete worker-pool implementation (I can propose exact diffs).
- Add a small shared library within the repo that provides:
  - Shared HTTP client factory
  - Bounded worker pool
  - Rate limiter wrapper
  - Retry policy helper
- Create a template for load tests (k6 or Locust) that simulates Google Ads usage patterns.

---

If you want, tell me which language and which service file to update and I will produce the exact code edits or PR-ready patch to integrate a bounded concurrency solution.