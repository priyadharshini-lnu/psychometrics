import React from 'react'
import { CampaignAssessmentGroup } from 'modules/admin/modules/campaigns/core/assessmentGroups/interfaces'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Switch, Popconfirm } from 'antd'
import Assessment from '../../Assessment'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

const { I18n } = window

interface OwnProps {
  group: CampaignAssessmentGroup
}

type Props = PropsFromRedux & OwnProps

const Group: React.FC<Props> = ({
  group, remove, openModal, update,
}) => (
  <div className={styles.container}>
    <div className="display-flex mb24">
      <div className={styles.id}>{group.id}</div>
      <div className={styles.title}>{group.name}</div>
      <span
        className={styles.icon}
        onClick={() => openModal('GroupFormModal', { campaignId: group.campaignId, group })}
      >
        <EditOutlined />
      </span>
      <span className={styles.icon}>
        <Popconfirm
          title={I18n.t('frontend.are_you_sure')}
          onConfirm={() => remove(group)}
          okText={I18n.t('frontend.yes')}
          cancelText={I18n.t('frontend.no')}
        >
          <DeleteOutlined />
        </Popconfirm>

      </span>
    </div>
    <div className={styles.switch}>
      <Switch
        checked={group.previousAssessmentsRequired}
        onChange={(checked) => { update(group, { previousAssessmentsRequired: checked }) }}
      />
      {'  '}
      <span>{I18n.t('assessments_reports.add_group_form.previous_assessments_required')}</span>
    </div>
    <div className={styles.switch}>
      <Switch
        checked={group.previousGroupRequired}
        onChange={(checked) => { update(group, { previousGroupRequired: checked }) }}
      />
      {'  '}
      <span>{I18n.t('assessments_reports.add_group_form.previous_group_required')}</span>
    </div>
    <div className="mt24">
      {
        group.assessments.length
          ? group.assessments.map(assessment => <Assessment key={assessment.id} assessment={assessment} />)
          : (
            <div className={styles.noneFound}>
              <span className={styles.noneFoundIcon} />
              <span className={styles.noneFoundDesc}>{I18n.t('assessments_reports.sequencing.no_assessments')}</span>
            </div>
          )
      }
    </div>
  </div>
)

export default Group
