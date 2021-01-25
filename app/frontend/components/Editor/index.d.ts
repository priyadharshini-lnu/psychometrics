declare module 'HTMLEditor'

declare function Editor({
  content,
  handleContentChange,
  type,
  details,
  className,
}: {
  content: string
  handleContentChange: (value: string) => void
  type?: string | null
  details?: string | null
  className?: string
}): JSX.Element

export = Editor
