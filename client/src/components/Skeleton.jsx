/*
  components/Skeleton.jsx — Modern Shimmer Loading Placeholders

  WHY SKELETON LOADERS OVER SPINNERS?
  Skeleton loaders give users an immediate structural preview of the page content
  before it finishes downloading. This perceived performance improvement makes
  the application feel significantly faster and more polished.
*/

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
      <div className="h-2 bg-gray-200 rounded-full w-full"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-gray-200"></div>
          <div className="w-7 h-7 rounded-full bg-gray-300"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="bg-surface border-b border-border py-6 px-6 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full mt-4"></div>
      </div>
    </div>
  )
}
