const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          {/* Background ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-800" />

          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        </div>

        <p className="text-sm text-gray-400 tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;