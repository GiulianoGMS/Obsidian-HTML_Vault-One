import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const FolderColors: QuartzComponent = (_props: QuartzComponentProps) => {
  const script = `
    (function applyFolderColors() {
      var ROOT_COLORS = {
        "10-Repos": "#7a77fd",
        "70-Projects, Tools & Integrations": "#5dea8e",
        "80-Paliativos - Nao precisa Reaplicar": "#7a77fd",
        "90-Custom Override": "#e86868"
      };
      var CHILD_OVERRIDES = {
        "On": { parent: "90-Custom Override", color: "#f8e791" }
      };

      function colorEl(el, color) {
        el.style.setProperty("color", color, "important");
        var svg = el.querySelector("svg");
        if (svg) svg.style.setProperty("color", color, "important");
      }

      function getParentFolderName(li) {
        var parentLi = li.parentElement && li.parentElement.closest("li");
        if (!parentLi) return null;
        var span = parentLi.querySelector(":scope > .folder-outer > .folder-element > .folder-title span");
        return span ? span.textContent.trim() : null;
      }

      function apply() {
        document.querySelectorAll(".explorer .folder-title").forEach(function(el) {
          var span = el.querySelector("span");
          if (!span) return;
          var name = span.textContent.trim();
          var li = el.closest("li");

          var override = CHILD_OVERRIDES[name];
          if (override && li && getParentFolderName(li) === override.parent) {
            colorEl(el, override.color);
          } else if (ROOT_COLORS[name]) {
            colorEl(el, ROOT_COLORS[name]);
          }
        });
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", apply);
      } else {
        apply();
      }
      document.addEventListener("nav", apply);
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

FolderColors.displayName = "FolderColors"
export default (() => FolderColors) satisfies QuartzComponentConstructor
