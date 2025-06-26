export type CommentUser = {
    firstName: string
    lastName: string
    photo?: string
}

export type SortBy = 'createdAt'

export interface Pagination {
  page: number
  pageSize: number
}

export interface Filters {
  sortBy?: SortBy
  sortOrder?: 'asc' | 'desc'
  showResolved?: boolean
  showUnread?: boolean
  showRead?: boolean
  showUnresolved?: boolean
}
