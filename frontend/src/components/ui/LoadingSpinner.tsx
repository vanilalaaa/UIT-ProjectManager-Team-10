export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-text-soft font-medium">
      <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm">{message}</p>
    </div>
  )
}