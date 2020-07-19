import React from 'react'
import styles from '../StaticContent.scss'

const Graphic = ({ model: { props: { graphicUrl } } }) => {
  if (graphicUrl) {
    return (<div className={styles.image}><img src={graphicUrl} /></div>)
  }
  return (<div>Select a graphic to use for this question</div>)
}

export default Graphic
