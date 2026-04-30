import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AdminPaginationProps {
  skip: number
  limit: number
  total: number
  onSkipChange: (skip: number) => void
}

export function AdminPagination({ skip, limit, total, onSkipChange }: AdminPaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (total <= limit) return null

  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        共 {total} 条，第 {currentPage} / {totalPages} 页
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onSkipChange(Math.max(0, skip - limit))}
          className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)] disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onSkipChange(skip + limit)}
          className="border-[rgba(0,210,255,0.2)] bg-transparent text-white hover:bg-[rgba(0,210,255,0.1)] disabled:opacity-30"
        >
          下一页
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
