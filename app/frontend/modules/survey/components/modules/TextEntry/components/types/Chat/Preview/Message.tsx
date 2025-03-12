import React from 'react'
import cs from 'classnames'
import { Button } from 'antd'
import { CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from './ChatStyle.less'
import commonStyles from '../ChatStyle.less'
import { Question, Message as MessageInterface } from '../interfaces'
import { MINE_TYPE } from '../constants'

const { I18n: I18nTextTranslations } = window

interface Props {
  message: MessageInterface
  model: Question
  isAnswer?: boolean
  readOnly?: boolean
}

const Message: React.FC<Props> = ({
  model, message, isAnswer, readOnly,
}) => {
  const deleteMessage = (): void => {
    model.result.answer(model.result.answers.filter(r => r.index !== message.position))
  }

  return (
    <div className={cs(styles.messageRow, { [commonStyles.messageRight]: message.type === MINE_TYPE })}>
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
          {isAnswer ? message.text : I18n().tQuestion(
            model, `messageText${message.position}`, { position: message.position },
          )}
        </div>
        {isAnswer && !readOnly && (
          <Button
            className={commonStyles.deleteIconContainer}
            onClick={deleteMessage}
            shape="circle"
            size="small"
            aria-label={I18nTextTranslations.t('frontend.aria.delete_message')}
            icon={<CloseOutlined className={commonStyles.deleteIcon} />}
          />
        )}
      </div>
    </div>
  )
}

export default Message
