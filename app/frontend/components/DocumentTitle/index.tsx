import { FC } from 'react'
import { displayName } from '~/utils/branding'

interface Props {
  text?: string
}

export const DocumentTitle: FC<Props> = ({ text }) => (
  <title>{text ? `${text} - ${displayName()}` : displayName()}</title>
)
