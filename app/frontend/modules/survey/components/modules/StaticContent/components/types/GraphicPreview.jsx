import styles from '../StaticContent.less'

const GraphicPreview = ({ model: { props: { graphicUrl } } }) => (
  <div className={styles.image}><img src={graphicUrl} /></div>
)

export default GraphicPreview
