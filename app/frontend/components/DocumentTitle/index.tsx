import { FC, useEffect } from 'react'
import { displayName } from '~/utils/branding'

interface Props {
  text?: string
}

export const DocumentTitle: FC<Props> = ({ text }) => {
  const title = text ? `${text} - ${displayName()}` : displayName()

  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
