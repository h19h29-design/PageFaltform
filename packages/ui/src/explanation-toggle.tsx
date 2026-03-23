"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ysplan-show-explanations";
const ROOT_CLASS_NAME = "show-explanations";

function applyExplanationState(show: boolean) {
  document.documentElement.classList.toggle(ROOT_CLASS_NAME, show);
}

export function ExplanationToggle() {
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    const nextValue = window.localStorage.getItem(STORAGE_KEY) === "true";

    setShowExplanations(nextValue);
    applyExplanationState(nextValue);
  }, []);

  function toggleExplanations() {
    const nextValue = !showExplanations;

    setShowExplanations(nextValue);
    window.localStorage.setItem(STORAGE_KEY, nextValue ? "true" : "false");
    applyExplanationState(nextValue);
  }

  return (
    <button
      aria-pressed={showExplanations}
      className="button button--ghost button--small explanation-toggle"
      onClick={toggleExplanations}
      type="button"
    >
      {showExplanations ? "\uC124\uBA85 \uC228\uAE30\uAE30" : "\uC124\uBA85 \uBCF4\uAE30"}
    </button>
  );
}
