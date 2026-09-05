'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <button
          onClick={reset}
          className="bg-transparent border border-ink/30 text-ink font-serif px-5 py-2.5 rounded-sm hover:bg-ink/5 active:bg-ink/10 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
