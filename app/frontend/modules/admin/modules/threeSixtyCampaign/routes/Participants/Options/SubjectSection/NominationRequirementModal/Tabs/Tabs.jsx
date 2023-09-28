import _ from 'lodash'
import { Tabs } from 'antd'
import styles from './styles.less'
import Tab from './Tab'
import ConditionsContainer from '../ConditionsContainer'

const { TabPane } = Tabs

export default function List (props) {
  const { changeSelectedIndex, nominationRequirements: { list } } = props
  if (_.isEmpty(list)) { return null }

  return (
    <Tabs
      defaultActiveKey="0"
      tabPosition="left"
      className={styles.tabs}
      onChange={key => changeSelectedIndex(parseInt(key, 10))}
    >
      {list.map((_, index) => (
        <TabPane
          key={index}
          tab={<Tab {...props} index={index} />}
        >
          <ConditionsContainer />
        </TabPane>
      ))
  }
    </Tabs>
  )
}
