
export interface AdminJob {
  id: number
  errorMessages: string[]
  content: string
  read: boolean
  status: string
  operation: string
  createdAt: string
  progress: number
}
