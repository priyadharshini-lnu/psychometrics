import { FC } from 'react'
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
  addNewGroup: (groupType: string) => void
  hideAddAssessmentCenterBtn: boolean
}

type Props = OwnProps & PropsFromRedux

const AddGroupComponent: FC<Props> = ({ isLoading, addNewGroup, hideAddAssessmentCenterBtn }) => (
  <Card className={cs('flex justify-center items-center h-100', styles.minHeightForGroup)}>
    <Space direction="vertical" className={cs('flex justify-center items-center')}>
      <Button type="dashed" onClick={() => addNewGroup('regular')} loading={isLoading} disabled={isLoading}>
        <Space>
          <PlusOutlined />
          {I18n.t('assessments_reports.sequencing.add_group')}
        </Space>
      </Button>
      {
      hideAddAssessmentCenterBtn && (
        <Button type="dashed" onClick={() => addNewGroup('assessment_center')} loading={isLoading} disabled={isLoading}>
          <Space>
            <PlusOutlined />
            {I18n.t('assessments_reports.sequencing.add_assessment_center')}
          </Space>
        </Button>
      )
    }
    </Space>
  </Card>
)

export const AddGroup = connector(AddGroupComponent)
