// src/accordion/Accordion.tsx
import { useState, useRef, useCallback, useEffect } from "react";

// src/utils/cn.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/accordion/Accordion.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function ChevronIcon({ className, isOpen }) {
  return /* @__PURE__ */ jsx(
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
      children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
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
    headerOffset = 0
  } = scrollConfig;
  const getInitialOpenIds = () => {
    if (!defaultOpen) return [];
    if (Array.isArray(defaultOpen)) return defaultOpen;
    return [defaultOpen];
  };
  const [openIds, setOpenIds] = useState(getInitialOpenIds);
  const [isMobile, setIsMobile] = useState(false);
  const [manuallySelected, setManuallySelected] = useState(false);
  const [manuallyClosedId, setManuallyClosedId] = useState(null);
  const itemRefs = useRef([]);
  const scrollTimeoutRef = useRef(null);
  const manualTimeoutRef = useRef(null);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const isScrollDetectionActive = scrollDetect && (!mobileOnly || isMobile);
  const handleToggle = useCallback((item, index) => {
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
  useEffect(() => {
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
      let closestIndex = -1;
      let closestDistance = Infinity;
      itemRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex >= 0 && closestDistance < effectiveViewportHeight * threshold) {
        const closestId = items[closestIndex]?.id;
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
  }, [isScrollDetectionActive, manuallySelected, manuallyClosedId, items, openIds, threshold, headerOffset, onValueChange]);
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsx("div", { className: cn("lite-kit-accordion space-y-3", className), children: items.map((item, index) => {
    const isOpen = openIds.includes(item.id);
    const Icon = item.icon;
    return /* @__PURE__ */ jsxs(
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
          /* @__PURE__ */ jsxs(
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
                Icon && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "lite-kit-accordion-icon",
                      "w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center",
                      "transition-all duration-300",
                      isOpen && "lite-kit-accordion-icon--active"
                    ),
                    children: /* @__PURE__ */ jsx(Icon, { className: "lite-kit-accordion-icon-svg w-6 h-6 transition-colors duration-300" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "lite-kit-accordion-text flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("h3", { className: "lite-kit-accordion-title", children: item.title }),
                  item.subtitle && /* @__PURE__ */ jsx(
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
                /* @__PURE__ */ jsx(ChevronIcon, { isOpen, className: "lite-kit-accordion-chevron-icon" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
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
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "lite-kit-accordion-content-inner leading-relaxed",
                    Icon ? "px-4 pb-4 pl-20" : "px-4 pb-4"
                  ),
                  children: typeof item.content === "string" ? /* @__PURE__ */ jsx("p", { children: item.content }) : item.content
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
export {
  Accordion,
  cn
};
//# sourceMappingURL=index.mjs.map