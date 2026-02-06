import React, {
  ChangeEvent, FC, useState, MouseEvent,
} from 'react'
import { Button, Modal, Typography } from 'antd'
import cs from 'classnames'
import { CheckOutlined, StopOutlined, ExpandOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { PreviewModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import { EMPTY_IMAGE_SRC } from '~/constants/image'

import styles from './styles.less'

interface Props {
  id: PreviewModel['id']
  multiple?: boolean
  isImagePreviewEnable: PreviewModel['props']['isImagePreviewEnable']
  imageChoiceSize: PreviewModel['props']['imageChoiceSize']
  choicesIds: PreviewModel['choicesIds']
  answers: PreviewModel['result']['answers']
  notApplicable: PreviewModel['props']['notApplicable']
  isNotApplicableChecked: PreviewModel['result']['notApplicable']
  defaultChoiceText: PreviewModel['moduleConfig']['defaultChoiceText']
  readOnly: boolean
  I18n: I18nInterface
  model: PreviewModel
  handleChoiceChange(event?: ChangeEvent<HTMLInputElement>): void
  handleNotApplicableChange(): void
}

const { I18n } = window

export const ImageChoices: FC<Props> = ({
  id,
  multiple = false,
  choicesIds,
  imageChoiceSize,
  isImagePreviewEnable,
  answers,
  notApplicable,
  isNotApplicableChecked,
  handleNotApplicableChange,
  handleChoiceChange,
  readOnly,
  model,
  defaultChoiceText,
  I18n,
}) => {
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
    <>
      <form
        className={cs(
          styles.grid,
          { [styles.largeSize]: imageChoiceSize === 'large' },
          { [styles.mediumSize]: imageChoiceSize === 'medium' },
          { [styles.smallSize]: imageChoiceSize === 'small' },
          { [styles.xsmallSize]: imageChoiceSize === 'x-small' },
          { [styles.xxsmallSize]: imageChoiceSize === 'xx-small' },
        )}
        onSubmit={event => event.preventDefault()}
      >
        {choicesIds.map((choiceId) => {
          const choice = answers.find(answer => answer.index === choiceId)
          const choiceAnswer = choice?.value ?? false

          const choiceImage = I18n.tQuestion(
            model,
            `choicesImages${choiceId + 1}`,
            {
              choice: choiceId,
            },
          )

          const choiceText = I18n.tQuestion(model, `choicesTexts${choiceId + 1}`, {
            choice: choiceId,
          }) || defaultChoiceText(choiceId + 1)

          return (
            <ImageChoiceCard
              key={choiceId}
              id={id}
              multiple={multiple}
              choiceId={choiceId}
              text={choiceText}
              src={choiceImage}
              isImagePreviewEnable={isImagePreviewEnable}
              onPreview={toggleImagePreviewer}
              isChecked={choiceAnswer}
              onChange={handleChoiceChange}
              isDisabled={readOnly}
            />
          )
        })}
        {notApplicable && (
          <ImageChoiceCard
            id={id}
            multiple={multiple}
            choiceId={-1}
            text={I18n.tQuestion(model, 'notApplicableLabel')}
            src={EMPTY_IMAGE_SRC}
            isNotApplicableOption
            isImagePreviewEnable={false}
            onPreview={toggleImagePreviewer}
            isChecked={isNotApplicableChecked}
            onChange={handleNotApplicableChange}
            isDisabled={readOnly}
          />
        )}
      </form>
      <Modal
        centered
        wrapClassName={styles.modalWrap}
        className={styles.modalBody}
        width={800}
        footer={null}
        focusable={{
          focusTriggerAfterClose: true,
        }}
        open={isPreviewModalOpen}
        onCancel={() => toggleImagePreviewer()}
      >
        <img src={imagePreviewSrc} width="100%" height="100%" loading="lazy" />
      </Modal>
    </>
  )
}

export const NotApplicableImageChoice: FC = () => <div>image n/a</div>

interface ImageChoiceCardProps {
  id: PreviewModel['id']
  multiple: boolean
  choiceId: PreviewModel['choicesIds'][0]
  text: string
  src: PreviewModel['props']['choicesImages'][0]
  isNotApplicableOption?: PreviewModel['props']['notApplicable']
  isImagePreviewEnable: PreviewModel['props']['isImagePreviewEnable']
  onPreview(previewSrc?: string, event?: React.MouseEvent | undefined): void
  isChecked: boolean
  onChange(event?: ChangeEvent<HTMLInputElement>): void
  isDisabled: Props['readOnly']
}

const ImageChoiceCard: FC<ImageChoiceCardProps> = ({
  id,
  multiple,
  choiceId,
  text,
  src = EMPTY_IMAGE_SRC,
  isNotApplicableOption = false,
  isImagePreviewEnable,
  onPreview,
  isChecked,
  onChange,
  isDisabled,
}) => (
  <div className={styles.imageInputContainer}>
    <input
      id={`mc-input-${id}-${choiceId}`}
      type={multiple ? 'checkbox' : 'radio'}
      name={`${id}`}
      value={choiceId}
      disabled={isDisabled}
      checked={isChecked}
      onChange={onChange}
      className={styles.input}
    />
    <label
      className={cs(styles.card, { [styles.checked]: isChecked })}
      htmlFor={`mc-input-${id}-${choiceId}`}
      key={choiceId}
    >
      <span
        aria-hidden
        className={cs(
          styles.checkmarkButton,
          'ant-btn ant-btn-circle ant-btn-icon-only',
          { 'ant-btn-primary': isChecked },
        )}
      >
        {isChecked && <CheckOutlined />}
      </span>
      {isNotApplicableOption ? (
        <StopOutlined className={styles.notApplicable} />
      ) : (
        <img loading="lazy" alt={text} src={src} />
      )}
      <Typography.Text aria-hidden="true" strong className="mt-2 mb-2 ta-c">
        {text}
      </Typography.Text>
    </label>
    {isImagePreviewEnable && (
      <Button
        className={styles.previewButton}
        shape="circle"
        icon={<ExpandOutlined />}
        onClick={event => onPreview(src, event)}
        aria-label={I18n.t('frontend.aria.enlarge_view_text', { text })}
      />
    )}
  </div>

)

export default ImageChoices
