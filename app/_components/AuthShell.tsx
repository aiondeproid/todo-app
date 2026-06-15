const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-5 py-3.5 text-base text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const buttonClassName =
  "w-full rounded-lg bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40";

type AuthShellProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-gray-100 px-4 py-14 font-sans sm:px-6 sm:py-20">
      <main className="w-full max-w-md rounded-lg bg-white px-6 py-8 shadow-sm sm:px-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-emerald-800">
          {title}
        </h1>
        {children}
        {footer && (
          <div className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}

export { inputClassName, buttonClassName };
