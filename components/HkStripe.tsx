/** Light HK touch: abstract MTR-line-style coloured stripes. */
export function HkStripe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-1.5 w-full overflow-hidden rounded-full ${className}`}
      aria-hidden
    >
      <span className="flex-1 bg-red-500" />
      <span className="flex-1 bg-blue-500" />
      <span className="flex-1 bg-green-500" />
      <span className="flex-1 bg-orange-500" />
      <span className="flex-1 bg-purple-500" />
      <span className="flex-1 bg-pink-400" />
    </div>
  );
}
