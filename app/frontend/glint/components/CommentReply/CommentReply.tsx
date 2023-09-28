import { FC, useState } from 'react'
import {
  Input, Avatar, Row, Col,
} from 'antd'
import { UserOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons'
import cs from 'classnames'

import styles from './CommentReply.less'

type Props = {
avatarUrl?: string,
onSendReply: (replyText: string) => void,
inputLoading: boolean,
}

export const CommentReply: FC<Props> = ({
  avatarUrl,
  onSendReply,
  inputLoading,
}) => {
  const [commentText, setCommentText] = useState('')
  const [hasValidText, setHasValidText] = useState(commentText.trim())

  const avatarIcon = avatarUrl ? null : <UserOutlined />

  const handleTextChange = ({ target }) => {
    setCommentText(target.value)
    setHasValidText(target.value.trim())
  }

  const handleSend = () => {
    hasValidText && onSendReply(commentText)
    setCommentText('')
  }

  return (
    <div>
      <Row gutter={[6, 0]} wrap={false} align="middle">
        <Col>
          <Avatar size={40} icon={avatarIcon} className={styles.avatar} />
        </Col>
        <Col flex="1">
          <Input
            onPressEnter={handleSend}
            value={commentText}
            onChange={handleTextChange}
            suffix={inputLoading ? <LoadingOutlined />
              : (
                <SendOutlined
                  className={cs({ [styles.sendIcon]: true, [styles.disable]: !hasValidText })}
                  onClick={handleSend}
                />
              )}
            disabled={inputLoading}
          />
        </Col>
      </Row>
    </div>
  )
}
