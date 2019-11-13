import React from 'react'
import { TagCloud } from 'react-tagcloud'
import styles from './TagCloud.scss'
import Series from './Series'
import { getCorrectResults } from '../ResultManager'

const Line = ({ model }) => {
  const sourceType = model.getSourceType()
  const sourceModel = model.getSourceModel()
  const data = Series[sourceType]
  if (!data) {
    return (
      <div>Supported only text entry</div>
    )
  }
  const series = data.series(getCorrectResults(model), sourceModel, model, model.props.dataFormat)
  const { fontFamily, fontSize } = model.props.style
  return (
    <div className={styles.graph} style={{ fontFamily, fontSize }}>
      <TagCloud
        minSize={12}
        maxSize={35}
        shuffle={false}
        tags={series}
      />
    </div>
  )
}

export default Line
