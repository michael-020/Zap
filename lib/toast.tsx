import toast from "react-hot-toast"

export const showSuccessToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
      } bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex border border-neutral-200 dark:border-neutral-800 dark:shadow-neutral-900`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* <div className="flex-shrink-0">
            <CheckCircle2 className="size-6 text-green-400" />
          </div> */}
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
      </div>
    </div>
  ), {
    position: 'top-right',
  });
};

