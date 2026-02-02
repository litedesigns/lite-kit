"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Accordion: () => Accordion,
  cn: () => cn
});
module.exports = __toCommonJS(index_exports);

// src/accordion/Accordion.tsx
var import_react = require("react");

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/accordion/Accordion.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ChevronIcon({ className, isOpen }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      className: cn(
        "lite-kit-accordion-chevron w-5 h-5 flex-shrink-0 transition-transform duration-300",
        isOpen && "lite-kit-accordion-chevron--open rotate-180",
        className
      ),
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "6 9 12 15 18 9" })
    }
  );
}
function Accordion({
  items,
  mode = "single",
  defaultOpen,
  collapsible = true,
  scrollDetect = false,
  scrollConfig = {},
  className,
  itemClassName,
  onValueChange
}) {
  const {
    threshold = 0.4,
    cooldown = 800,
    scrollToCenter = true,
    mobileOnly = true,
    headerOffset = 0,
    hysteresis = 50
  } = scrollConfig;
  const getInitialOpenIds = () => {
    if (!defaultOpen) return [];
    if (Array.isArray(defaultOpen)) return defaultOpen;
    return [defaultOpen];
  };
  const [openIds, setOpenIds] = (0, import_react.useState)(getInitialOpenIds);
  const [isMobile, setIsMobile] = (0, import_react.useState)(false);
  const [manuallySelected, setManuallySelected] = (0, import_react.useState)(false);
  const [manuallyClosedId, setManuallyClosedId] = (0, import_react.useState)(null);
  const itemRefs = (0, import_react.useRef)([]);
  const scrollTimeoutRef = (0, import_react.useRef)(null);
  const manualTimeoutRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const isScrollDetectionActive = scrollDetect && (!mobileOnly || isMobile);
  const handleToggle = (0, import_react.useCallback)((item, index) => {
    const isOpen = openIds.includes(item.id);
    if (isScrollDetectionActive) {
      setManuallySelected(true);
      if (scrollToCenter && !isOpen) {
        const element = itemRefs.current[index];
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      }
      if (manualTimeoutRef.current) {
        clearTimeout(manualTimeoutRef.current);
      }
      manualTimeoutRef.current = setTimeout(() => {
        setManuallySelected(false);
      }, cooldown);
    }
    if (isOpen) {
      if (collapsible || openIds.length > 1) {
        if (isScrollDetectionActive) {
          setManuallyClosedId(item.id);
        }
        const newIds = openIds.filter((id) => id !== item.id);
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    } else {
      setManuallyClosedId(null);
      if (mode === "single") {
        setOpenIds([item.id]);
        onValueChange?.([item.id]);
      } else {
        const newIds = [...openIds, item.id];
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    }
  }, [openIds, mode, collapsible, isScrollDetectionActive, scrollToCenter, cooldown, onValueChange]);
  (0, import_react.useEffect)(() => {
    if (!isScrollDetectionActive) return;
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setManuallySelected(false);
      }, 150);
      if (manuallySelected) return;
      const viewportHeight = window.innerHeight;
      const effectiveViewportHeight = viewportHeight - headerOffset;
      const viewportCenter = headerOffset + effectiveViewportHeight / 2;
      const currentOpenIndex = openIds.length > 0 ? items.findIndex((item) => item.id === openIds[0]) : -1;
      let currentCenterDistance = Infinity;
      if (currentOpenIndex >= 0) {
        const currentRef = itemRefs.current[currentOpenIndex];
        if (currentRef) {
          const rect = currentRef.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          currentCenterDistance = Math.abs(cardCenter - viewportCenter);
        }
      }
      let candidateIndex = -1;
      let candidateHeadDistance = Infinity;
      itemRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const cardHead = rect.top;
        const distance = Math.abs(cardHead - viewportCenter);
        if (distance < candidateHeadDistance) {
          candidateHeadDistance = distance;
          candidateIndex = index;
        }
      });
      const shouldSwitch = candidateIndex >= 0 && candidateHeadDistance < effectiveViewportHeight * threshold && (currentOpenIndex === -1 || candidateHeadDistance + hysteresis < currentCenterDistance);
      if (shouldSwitch) {
        const closestId = items[candidateIndex]?.id;
        if (manuallyClosedId !== null && closestId !== manuallyClosedId) {
          setManuallyClosedId(null);
        }
        if (closestId !== manuallyClosedId && closestId !== openIds[0]) {
          setOpenIds([closestId]);
          onValueChange?.([closestId]);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrollDetectionActive, manuallySelected, manuallyClosedId, items, openIds, threshold, headerOffset, hysteresis, onValueChange]);
  (0, import_react.useEffect)(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("lite-kit-accordion space-y-3", className), children: items.map((item, index) => {
    const isOpen = openIds.includes(item.id);
    const Icon = item.icon;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        ref: (el) => {
          itemRefs.current[index] = el;
        },
        className: cn(
          "lite-kit-accordion-item overflow-hidden transition-all duration-300 ease-out",
          isOpen && "lite-kit-accordion-item--open",
          itemClassName
        ),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => handleToggle(item, index),
              className: cn(
                "lite-kit-accordion-header",
                "w-full flex items-center p-4 text-left cursor-pointer",
                "transition-colors duration-200 active:scale-[0.99]"
              ),
              "aria-expanded": isOpen,
              "aria-controls": `accordion-content-${item.id}`,
              children: [
                Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    className: cn(
                      "lite-kit-accordion-icon",
                      "w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center",
                      "transition-all duration-300",
                      isOpen && "lite-kit-accordion-icon--active"
                    ),
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "lite-kit-accordion-icon-svg w-6 h-6 transition-colors duration-300" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lite-kit-accordion-text flex-1 min-w-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "lite-kit-accordion-title", children: item.title }),
                  item.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "p",
                    {
                      className: cn(
                        "lite-kit-accordion-subtitle mt-0.5 transition-colors duration-300",
                        isOpen && "lite-kit-accordion-subtitle--active"
                      ),
                      children: item.subtitle
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronIcon, { isOpen, className: "lite-kit-accordion-chevron-icon" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              id: `accordion-content-${item.id}`,
              className: cn(
                "lite-kit-accordion-content",
                "overflow-hidden transition-all duration-300 ease-out",
                isOpen ? "lite-kit-accordion-content--open max-h-96 opacity-100" : "lite-kit-accordion-content--closed max-h-0 opacity-0"
              ),
              role: "region",
              "aria-labelledby": `accordion-header-${item.id}`,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  className: cn(
                    "lite-kit-accordion-content-inner leading-relaxed",
                    Icon ? "px-4 pb-4 pl-20" : "px-4 pb-4"
                  ),
                  children: typeof item.content === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.content }) : item.content
                }
              )
            }
          )
        ]
      },
      item.id
    );
  }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Accordion,
  cn
});
//# sourceMappingURL=index.js.map