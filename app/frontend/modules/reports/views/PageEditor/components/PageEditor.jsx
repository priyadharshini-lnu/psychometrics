import FixedHeader from '~/modules/reports/views/FixedHeader'
import PropertyPanel from '~/modules/reports/views/PropertyPanel'
import styles from './PageEditor.less'
import LeftSide from './LeftSide'
import RightSide from './RightSide'

const PageEditor = props => (
  <div className={styles.main}>
    <FixedHeader />
    <LeftSide {...props} />
    <RightSide />
    <PropertyPanel />
  </div>
)

export default PageEditor
