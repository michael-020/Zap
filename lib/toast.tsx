import { CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast"

export const showSuccessToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
      } bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex border border-neutral-200 dark:border-neutral-800 dark:shadow-neutral-900`}
    >
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="size-6 text-neutral-500 dark:text-neutral-400" />
          </div> 
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {message}
          </p>
        </div>
      </div>
    </div>
  ), {
    position: 'top-right',
  });
};

export const showToast = (message: string, duration: number) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
      } bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex border border-neutral-200 dark:border-neutral-800 dark:shadow-neutral-900`}
    >
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 whitespace-pre-line">
            {message}
          </p>
        </div>
      </div>
    </div>
  ), {
    position: 'top-right',
    duration
  });
};

export const showLoaderToast = (message: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-custom-enter" : "animate-custom-leave"
        } bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex border border-neutral-200 dark:border-neutral-800 dark:shadow-neutral-900`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-neutral-500 dark:text-neutral-400" />
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      position: "top-right",
      duration: 3000,
    }
  );
};