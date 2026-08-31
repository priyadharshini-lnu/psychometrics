import { FC, useEffect, useRef } from 'react'
import { Radio, Space } from 'antd'

import {
  ImageChoiceBuilder,
  NotApplicableImageChoice,
} from '~/modules/survey/components/modules/MultipleChoice/components/ImageChoiceBuilder'
import Socket from '~/modules/survey/cable'
import LibraryTransport from '~/modules/survey/cable/LibraryChannel'
import { LibraryStore } from '~/libs/library'
import useForceUpdate from '~/hooks/useUpdate'

import { BuilderModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import LabelEditor from '~/modules/survey/components/LabelEditor'

interface Props {
  model: BuilderModel
}

const SingleAnswer: FC<Props> = ({ model }) => {
  const {
    moduleConfig,
    props: {
      notApplicable,
      notApplicableLabel,
      choices,
      choicesTexts,
      position,
      withImageChoice,
      choicesImages,
    },
  } = model

  const forceUpdate = useForceUpdate()

  const librarySocket = useRef<ReturnType<typeof Socket.library> | null>(null)

  useEffect(() => {
    LibraryTransport.init()
    librarySocket.current = Socket.library()
  }, [])

  const changeLabel = (i: number, value: string) => {
    model.changeArrayProps({ collection: 'choicesTexts', i, val: value })
    forceUpdate()
  }

  const handleNotApplicableLabelChange = (value: string) => {
    model.changeProps({ notApplicableLabel: value })
    forceUpdate()
  }

  const handleImageClick = (index: number) => {
    LibraryStore.openPopup(
      librarySocket.current,
      item => handleImageSelect(item, index),
      'image',
    )
  }

  const handleImageSelect = (item, index: number) => {
    if (index >= 0 && item && item.file) {
      model.changeArrayProps({
        collection: 'choicesImages',
        i: index,
        val: item.file,
      })
    }
  }

  return (
    <Radio.Group value={null} className="mb-4">
      <Space
        direction={position === 'Horizontal' ? 'horizontal' : 'vertical'}
        size="small"
        wrap
      >
        {Array.from({ length: choices }, (_, index) => (
          <Radio key={index}>
            {withImageChoice && (
              <ImageChoiceBuilder
                index={index}
                src={choicesImages?.[index] ?? null}
                onClick={handleImageClick}
              />
            )}
            <LabelEditor
              value={
                choicesTexts[index] || moduleConfig.defaultChoiceText(index + 1)
              }
              onChange={(value: string) => changeLabel(index, value)}
            />
          </Radio>
        ))}
        {notApplicable && (
          <Radio>
            {withImageChoice && <NotApplicableImageChoice />}
            <LabelEditor
              value={notApplicableLabel}
              onChange={handleNotApplicableLabelChange}
            />
          </Radio>
        )}
      </Space>
    </Radio.Group>
  )
}

export default SingleAnswer
