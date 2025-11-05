"use client";

import { showSuccessToast } from "@/lib/toast";

export function ToastButton() {
  return (
    <div>
      <button 
        onClick={() => showSuccessToast("Website Generated Successfully")}
        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
      >
        Click to See a Custom Toast
      </button>
    </div>
  );
}