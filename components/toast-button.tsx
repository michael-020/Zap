"use client";

import { showLoaderToast, showToast } from "@/lib/toast";

export function ToastButton() {
  return (
    <div>
      <button 
        onClick={() => showToast("Installing Packages.\nPlease wait as it may take while for \n the installation process to complete", 5000)}
        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
      >
        Click to See a Custom Toast
      </button>
    </div>
  );
}