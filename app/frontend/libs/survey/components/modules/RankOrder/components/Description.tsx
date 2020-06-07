import React from 'react'
import LabelEditor from 'libs/survey/components/LabelEditor'
import _ from 'lodash'
import styles from './RankOrder.scss'
import { Question } from '../interfaces'

interface Props {
  model: Question
  index: number
}

const Description: React.FC<Props> = ({
  model, model: {
    props: { showDescription, descriptionList }, moduleConfig: { defaultDescription },
  }, index,
}) => {
  const handleChange = (index: number, text: string): void => {
    const newDescriptionList = _.times(index + 1, (i: number) => {
      if (index === i) return text
      return descriptionList[i] || ''
    })
    model.changeProps({ descriptionList: [...newDescriptionList, ...descriptionList.slice(index + 1)] })
  }

  return (
    <div>
      {showDescription && (
        <LabelEditor
          onChange={(e: string): void => handleChange(index, e)}
          maxWidth={150}
          value={descriptionList[index] || defaultDescription}
          styles={styles.description}
        />
      )}
    </div>
  )
}

export default Description
