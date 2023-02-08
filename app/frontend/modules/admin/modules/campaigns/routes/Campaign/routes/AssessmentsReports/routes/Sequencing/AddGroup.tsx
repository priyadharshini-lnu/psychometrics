import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Button, Card, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import cs from 'classnames'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  CREATE,
} from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { isRequestInProgress } from '~/core/request'

import styles from './styles.less'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    isLoading: isRequestInProgress(state, CREATE),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  addNewGroup: () => void
}

type Props = OwnProps & PropsFromRedux

const AddGroupComponent: FC<Props> = ({ isLoading, addNewGroup }) => (
  <Card className={cs('flex justify-center items-center h-100', styles.minHeightForGroup)}>
    <Button type="dashed" onClick={addNewGroup} loading={isLoading} disabled={isLoading}>
      <Space>
        <PlusOutlined />
        {I18n.t('assessments_reports.sequencing.add_group')}
      </Space>
    </Button>
  </Card>
)

export const AddGroup = connector(AddGroupComponent)
