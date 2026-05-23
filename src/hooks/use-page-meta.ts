import { useEffect } from "react";

type PageMetaOptions = {
  title: string;
  description?: string;
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function usePageMeta({ title, description, robots, jsonLd }: PageMetaOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMeta("description", description);
    }

    if (robots) {
      setMeta("robots", robots);
    }

    const existing = document.getElementById("page-json-ld");
    if (existing) {
      existing.remove();
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "page-json-ld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, robots, jsonLd]);
}
