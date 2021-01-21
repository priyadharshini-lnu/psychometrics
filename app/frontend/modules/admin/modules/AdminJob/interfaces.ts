
export interface AdminJob {
  id: number
  errorMessages: string[]
  details: string[][]
  content: string
  isValid: boolean
  read: boolean
  status: string
  operation: string
  createdAt: string
  progress: number
  titleLink: {
    href: string
    label: string
  }
}
