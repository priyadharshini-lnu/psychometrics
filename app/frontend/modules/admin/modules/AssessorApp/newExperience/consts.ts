export type CompletionStatus = 'completed' | 'in_progress' | 'not_started'

export const statusColorMap: Record<CompletionStatus, string> = {
  completed: 'green',
  in_progress: 'blue',
  not_started: 'orange',
}

export const statusLabelKey: Record<CompletionStatus, string> = {
  completed: 'admin.completed',
  in_progress: 'admin.in_progress',
  not_started: 'admin.not_started',
}
