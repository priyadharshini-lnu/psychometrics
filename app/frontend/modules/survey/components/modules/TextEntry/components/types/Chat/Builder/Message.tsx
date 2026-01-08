import React from 'react'
import {
  DragSource, DropTarget, DragSourceMonitor, ConnectDragPreview, ConnectDragSource, ConnectDropTarget,
  DropTargetMonitor,
} from 'react-dnd'
import cs from 'classnames'
import { CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import MultiInlineEditor from '../../../../../../MultiInlineEditor'
import styles from './ChatStyle.less'
import commonStyles from '../ChatStyle.less'
import { Message as MessageInterface } from '../interfaces'
import { MINE_TYPE } from '../constants'

interface MessageProps {
  message: MessageInterface
  messageList: MessageInterface[]
  moveMessage: (dragPosition: number, hoverPosition: number) => void
  updateMessageList: (value: MessageInterface[]) => void
}

interface DragProps {
  isDragging: DragSourceMonitor
  connectDragSource: ConnectDragSource
  connectDragPreview: ConnectDragPreview
  connectDropTarget: ConnectDropTarget
}

type Props = MessageProps & DragProps

const Message: React.FC<Props> = ({
  message, isDragging, connectDragSource, connectDragPreview, connectDropTarget, messageList, updateMessageList,
}) => {
  const opacity = isDragging ? 0.5 : 1

  const changeMessageText = (value: string): void => {
    updateMessageList(messageList.map(m => (m.position === message.position ? { ...m, text: value } : m)))
  }

  const deleteMessage = (): void => updateMessageList(messageList.filter(m => m.position !== message.position))


  return connectDragPreview(connectDropTarget(
    <div
      className={cs(styles.messageRow, { [commonStyles.messageRight]: message.type === MINE_TYPE })}
      style={{ opacity }}
    >
      {connectDragSource(<i className={cs('fa fa-bars', commonStyles.draggingIcon)} />)}
      <div
        className={cs(
          commonStyles.messageContainer, { [commonStyles.messageContainerRight]: message.type === MINE_TYPE },
        )}
      >
        <div
          className={cs(
            commonStyles.message,
            message.type === MINE_TYPE ? styles.mine : commonStyles.their,
            { [commonStyles.mineCommon]: message.type === MINE_TYPE },
          )}
        >
          <MultiInlineEditor value={message.text} onChange={changeMessageText} width={300} />
        </div>
        <div className={commonStyles.deleteIconContainer}>
          <CloseOutlined onClick={deleteMessage} className={commonStyles.deleteIcon} />
        </div>
      </div>
    </div>,
  ))
}

const messageTarget = {
  hover (props: Props, monitor: DropTargetMonitor): void {
    const dragPosition = monitor.getItem().position
    const hoverPosition = props.message.position

    if (dragPosition === hoverPosition) return

    monitor.getItem().position = hoverPosition

    props.moveMessage(dragPosition, hoverPosition)
  },
}

const messageSource = {
  beginDrag ({ message: { position } }: Props): object {
    return {
      position,
    }
  },
  isDragging (props: Props, monitor: DragSourceMonitor): boolean {
    return monitor.getItem().position === props.message.position
  },
  endDrag ({ messageList, updateMessageList }: Props): void {
    updateMessageList(messageList)
  },
}

export default DropTarget('message', messageTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource<MessageProps>('message', messageSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))(Message),
)
