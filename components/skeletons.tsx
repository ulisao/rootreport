import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TableSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-1/4 bg-zinc-800" />
        <Skeleton className="h-4 w-1/3 bg-zinc-800" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}