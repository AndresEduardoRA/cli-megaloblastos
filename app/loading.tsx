export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-900">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-amber-200 dark:border-amber-900" />
        {/* Spinning inner ring */}
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
        
        {/* Pulse effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-amber-600/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
