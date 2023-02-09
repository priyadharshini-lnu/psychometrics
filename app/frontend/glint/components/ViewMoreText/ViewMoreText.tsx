import { useState, FC } from 'react'
import { Button, Typography } from 'antd'
import styles from './styles.less'

const { Text } = Typography

type ViewMoreTextProps = {
  text: string
  maxTextLen: number
  viewMoreLinkText?: string
  viewLessLinkText?: string
}

export const ViewMoreText: FC<ViewMoreTextProps> = ({
  text,
  maxTextLen,
  viewMoreLinkText = 'View more',
  viewLessLinkText = 'View less',
}) => {
  const [expanded, setExpanded] = useState(false)
  const lessText = text.slice(0, maxTextLen).trim()
  const isShorterText = text.length < maxTextLen

  const lessTextElement = (
    <>
      {lessText}
      ...
      <Button type="link" className={styles.vewMoreLink} onClick={() => setExpanded(expanded => !expanded)}>
        {viewMoreLinkText}
      </Button>
    </>
  )

  const moreTextElement = (
    <>
      {text}
      {' '}
      <Button type="link" className={styles.vewMoreLink} onClick={() => setExpanded(expanded => !expanded)}>
        {viewLessLinkText}
      </Button>
    </>
  )

  if (isShorterText) {
    return <Text>{text}</Text>
  }

  return (expanded ? moreTextElement : lessTextElement)
}
