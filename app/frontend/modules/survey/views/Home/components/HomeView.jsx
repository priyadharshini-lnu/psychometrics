import BlockList from '~/modules/survey/views/BlockList'
import Instructions from '~/modules/survey/views/Instructions'
import styles from './HomeView.less'

const HomeView = () => (
  <div className={styles.survey}>
    <Instructions />
    <BlockList />
  </div>
)

export default HomeView
