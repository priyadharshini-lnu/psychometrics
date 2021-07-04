import React, {
  ChangeEvent, FC, useState, MouseEvent,
} from 'react'
import { Button, Modal, Typography } from 'antd'
import { ExpandOutlined, CheckOutlined } from '@ant-design/icons'
import cs from 'classnames'

import { PreviewModel } from 'modules/survey/interfaces/questions/MultipleChoice'
import { I18nInterface } from 'modules/survey/core/preview/FlowProcessor/interfaces'

import styles from './styles.scss'

interface Props {
  id: PreviewModel['id']
  isImagePreviewEnable: PreviewModel['props']['isImagePreviewEnable']
  imageChoiceSize: PreviewModel['props']['imageChoiceSize']
  choicesIds: PreviewModel['choicesIds']
  choicesImages: PreviewModel['props']['choicesImages']
  answers: PreviewModel['result']['answers']
  notApplicable: PreviewModel['props']['notApplicable']
  isNotApplicableChecked: PreviewModel['result']['notApplicable']
  defaultChoiceText: PreviewModel['moduleConfig']['defaultChoiceText']
  readOnly: boolean
  I18n: I18nInterface
  model: PreviewModel
  handleChoiceChange(event: ChangeEvent<HTMLInputElement>): void
  handleNotApplicableChange(): void
}

export const ImageChoices: FC<Props> = ({
  choicesIds,
  imageChoiceSize,
  isImagePreviewEnable,
  answers,
  choicesImages,
  handleChoiceChange,
  model,
  defaultChoiceText,
  I18n,
}) => {
  let imageHeight = 22
  if (imageChoiceSize === 'medium') {
    imageHeight = 28
  } else if (imageChoiceSize === 'large') {
    imageHeight = 32
  }

  const [imagePreviewSrc, setImagePreviewSrc] = useState('')
  const [isPreviewModalOpen, setPreviewModal] = useState(false)

  const toggleImagePreviewer = (previewSrc = '', event?: MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    if (!isImagePreviewEnable) {
      return
    }

    if (previewSrc.length === 0) {
      setImagePreviewSrc('')
      setPreviewModal(false)
    } else {
      setImagePreviewSrc(previewSrc)
      setPreviewModal(true)
    }
  }

  return (
    <form
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(calc(${imageHeight}rem - 2rem), 1fr))`,
      }}
      onSubmit={event => event.preventDefault()}
    >
      {choicesIds.map((choiceId) => {
        const choice = answers.find(answer => answer.index === choiceId)
        const choiceAnswer = choice?.value ?? false

        const choiceImage = choicesImages[choiceId]

        const choiceText = I18n.tQuestion(model, `choicesTexts${choiceId + 1}`, {
          choice: choiceId,
        }) || defaultChoiceText(choiceId + 1)

        return (
          <label
            className={styles.card}
            htmlFor={`radio-${choiceId}`}
            style={{ borderColor: choiceAnswer ? '#01837F' : '#d9d9d9' }}
            key={choiceId}
          >
            <span
              className={cs(
                styles.checkmarkButton,
                'ant-btn ant-btn-circle ant-btn-icon-only',
                { 'ant-btn-primary': choiceAnswer },
              )}
            >
              {choiceAnswer && <CheckOutlined />}
              <input
                id={`radio-${choiceId}`}
                type="radio"
                className="hidden"
                name={choiceText}
                value={choiceId}
                checked={choiceAnswer}
                onChange={handleChoiceChange}
              />
            </span>
            {isImagePreviewEnable && (
              <Button
                className={styles.previewButton}
                shape="circle"
                icon={<ExpandOutlined />}
                onClick={event => toggleImagePreviewer(choiceImage, event)}
              />
            )}
            <img
              loading="lazy"
              alt={choiceText}
              src={choiceImage}
              style={{ height: `${imageHeight}rem` }}
            />
            <Typography.Text strong className="mt-2 mb-2 ta-c">
              {choiceText}
            </Typography.Text>
          </label>
        )
      })}
      <Modal
        centered
        wrapClassName={styles.modalWrap}
        className={styles.modalBody}
        width={800}
        footer={null}
        focusTriggerAfterClose={false}
        visible={isPreviewModalOpen}
        onCancel={() => toggleImagePreviewer()}
      >
        <img src={imagePreviewSrc} width="100%" height="100%" loading="eager" />
      </Modal>
    </form>
  )
}

export const NotApplicableImageChoice: FC = () => <div>image n/a</div>

export default ImageChoices
