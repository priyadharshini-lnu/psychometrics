import React from 'react'
import _ from 'lodash'
import { Tabs } from 'antd'
import css from './style.scss'
import Tab from './Tab'
import ConditionsContainer from '../ConditionsContainer'

const { TabPane } = Tabs

export default function List (props) {
  const { nominationRequirements: { list } } = props
  if (_.isEmpty(list)) { return null }

  return (
    <Tabs
      defaultActiveKey="0"
      tabPosition="left"
      className={css.tabs}
      onChange={key => props.changeSelectedIndex(parseInt(key, 10))}
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
