import React from 'react'
import styles from '../StaticContent.scss'

const GraphicPreview = ({ model: { props: { graphicUrl } } }) => (
  <div className={styles.image}><img src={graphicUrl} /></div>
)

export default GraphicPreview
