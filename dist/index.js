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
  cn: () => cn,
  useScrollDetection: () => useScrollDetection
});
module.exports = __toCommonJS(index_exports);

// src/accordion/Accordion.tsx
var import_react2 = require("react");

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/accordion/useScrollDetection.ts
var import_react = require("react");
function useScrollDetection({
  itemRefs,
  itemCount,
  enabled,
  config = {},
  onActiveChange,
  activeIndex
}) {
  const { hysteresis = 0.3, scrollToCenter = true } = config;
  const [isManuallySelected, setIsManuallySelected] = (0, import_react.useState)(false);
  const [manuallyClosedIndex, setManuallyClosedIndex] = (0, import_react.useState)(null);
  const manualInteractionTimeoutRef = (0, import_react.useRef)(null);
  const handleManualInteraction = (0, import_react.useCallback)((index) => {
    setIsManuallySelected(true);
    if (scrollToCenter && itemRefs.current) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
    if (manualInteractionTimeoutRef.current) {
      clearTimeout(manualInteractionTimeoutRef.current);
    }
    manualInteractionTimeoutRef.current = setTimeout(() => {
      setIsManuallySelected(false);
    }, 800);
  }, [scrollToCenter, itemRefs]);
  const markAsManuallyClosed = (0, import_react.useCallback)((index) => {
    setManuallyClosedIndex(index);
  }, []);
  const clearManuallyClosed = (0, import_react.useCallback)(() => {
    setManuallyClosedIndex(null);
  }, []);
  (0, import_react.useEffect)(() => {
    if (!enabled) return;
    const handleScroll = () => {
      if (isManuallySelected) return;
      const refs = itemRefs.current;
      if (!refs) return;
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      let closestIndex = null;
      let closestDistance = Infinity;
      for (let i = 0; i < itemCount; i++) {
        const ref = refs[i];
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
      }
      if (closestIndex !== null && closestIndex !== activeIndex) {
        if (activeIndex !== null && refs[activeIndex]) {
          const currentRect = refs[activeIndex].getBoundingClientRect();
          const currentDistance = Math.abs(
            currentRect.top + currentRect.height / 2 - viewportCenter
          );
          const threshold = 1 - hysteresis;
          if (closestDistance >= currentDistance * threshold) {
            return;
          }
        }
        if (manuallyClosedIndex !== null && closestIndex !== manuallyClosedIndex) {
          setManuallyClosedIndex(null);
        }
        if (closestIndex !== manuallyClosedIndex) {
          onActiveChange(closestIndex);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    enabled,
    isManuallySelected,
    itemRefs,
    itemCount,
    hysteresis,
    activeIndex,
    manuallyClosedIndex,
    onActiveChange
  ]);
  (0, import_react.useEffect)(() => {
    return () => {
      if (manualInteractionTimeoutRef.current) {
        clearTimeout(manualInteractionTimeoutRef.current);
      }
    };
  }, []);
  return {
    handleManualInteraction,
    isManuallySelected,
    manuallyClosedIndex,
    clearManuallyClosed
  };
}

// src/accordion/Accordion.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ChevronIcon({ className, isOpen }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      className: cn(
        "transition-transform duration-300",
        isOpen && "rotate-180",
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
  scrollConfig,
  variant = "default",
  theme = "system",
  className,
  itemClassName,
  onValueChange
}) {
  const getInitialOpenIds = () => {
    if (!defaultOpen) return [];
    if (Array.isArray(defaultOpen)) return defaultOpen;
    return [defaultOpen];
  };
  const [openIds, setOpenIds] = (0, import_react2.useState)(getInitialOpenIds);
  const itemRefs = (0, import_react2.useRef)([]);
  const [manuallyClosedId, setManuallyClosedId] = (0, import_react2.useState)(null);
  const activeIndex = openIds.length > 0 ? items.findIndex((item) => item.id === openIds[0]) : null;
  const {
    handleManualInteraction,
    isManuallySelected,
    manuallyClosedIndex,
    clearManuallyClosed
  } = useScrollDetection({
    itemRefs,
    itemCount: items.length,
    enabled: scrollDetect,
    config: scrollConfig,
    activeIndex,
    onActiveChange: (index) => {
      if (index !== null) {
        const newId = items[index]?.id;
        if (newId && newId !== manuallyClosedId) {
          setOpenIds([newId]);
          onValueChange?.([newId]);
        }
      }
    }
  });
  const handleToggle = (0, import_react2.useCallback)((item, index) => {
    const isOpen = openIds.includes(item.id);
    if (scrollDetect) {
      handleManualInteraction(index);
    }
    if (isOpen) {
      if (collapsible || openIds.length > 1) {
        if (scrollDetect) {
          setManuallyClosedId(item.id);
        }
        const newIds = openIds.filter((id) => id !== item.id);
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    } else {
      setManuallyClosedId(null);
      clearManuallyClosed();
      if (mode === "single") {
        setOpenIds([item.id]);
        onValueChange?.([item.id]);
      } else {
        const newIds = [...openIds, item.id];
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    }
  }, [openIds, mode, collapsible, scrollDetect, handleManualInteraction, clearManuallyClosed, onValueChange]);
  (0, import_react2.useEffect)(() => {
    if (manuallyClosedIndex !== null) {
      const closedId = items[manuallyClosedIndex]?.id;
      if (closedId !== manuallyClosedId) {
        setManuallyClosedId(null);
      }
    }
  }, [manuallyClosedIndex, items, manuallyClosedId]);
  const themeAttr = theme !== "system" ? { "data-theme": theme } : {};
  const getContainerStyles = () => {
    switch (variant) {
      case "card":
        return "space-y-4";
      case "minimal":
        return "divide-y divide-[var(--accordion-border)]";
      default:
        return "space-y-2";
    }
  };
  const getItemStyles = (isOpen) => {
    const base = "transition-all duration-300 ease-out";
    switch (variant) {
      case "card":
        return cn(
          base,
          "rounded-lg border border-[var(--accordion-border)] bg-[var(--accordion-bg)]",
          "shadow-sm backdrop-blur-sm",
          isOpen && "ring-1 ring-[var(--accordion-border)]"
        );
      case "minimal":
        return cn(base, "bg-transparent");
      default:
        return cn(
          base,
          "rounded-lg border border-[var(--accordion-border)] bg-[var(--accordion-bg)]",
          "overflow-hidden"
        );
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: cn("lite-kit-accordion", getContainerStyles(), className),
      ...themeAttr,
      children: items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const Icon = item.icon;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            ref: (el) => {
              itemRefs.current[index] = el;
            },
            className: cn(getItemStyles(isOpen), itemClassName),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => handleToggle(item, index),
                  className: cn(
                    "w-full flex items-center gap-4 p-4 text-left cursor-pointer",
                    "transition-colors duration-200",
                    "active:scale-[0.99]"
                  ),
                  "aria-expanded": isOpen,
                  "aria-controls": `accordion-content-${item.id}`,
                  children: [
                    Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "div",
                      {
                        className: cn(
                          "w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center",
                          "transition-all duration-500",
                          isOpen ? "bg-[var(--accordion-icon-bg-active)]" : "bg-[var(--accordion-icon-bg)]"
                        ),
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          Icon,
                          {
                            className: cn(
                              "w-6 h-6 transition-colors duration-300",
                              isOpen ? "text-[var(--accordion-icon-active)]" : "text-[var(--accordion-icon)]"
                            )
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "h3",
                        {
                          className: cn(
                            "font-semibold text-[var(--accordion-text)]",
                            variant === "minimal" ? "text-base" : "text-base"
                          ),
                          children: item.title
                        }
                      ),
                      item.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "p",
                        {
                          className: cn(
                            "text-sm transition-colors duration-300 mt-0.5",
                            isOpen ? "text-[var(--accordion-text-muted)]" : "text-[var(--accordion-text-subtle)]"
                          ),
                          children: item.subtitle
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      ChevronIcon,
                      {
                        className: "flex-shrink-0 text-[var(--accordion-text-muted)]",
                        isOpen
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  id: `accordion-content-${item.id}`,
                  className: cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  ),
                  role: "region",
                  "aria-labelledby": `accordion-header-${item.id}`,
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "div",
                    {
                      className: cn(
                        "text-[var(--accordion-text-muted)] leading-relaxed",
                        Icon ? "px-4 pb-4 pl-20" : "px-4 pb-4",
                        variant === "minimal" && "px-0 pb-4"
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
      })
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Accordion,
  cn,
  useScrollDetection
});
//# sourceMappingURL=index.js.map