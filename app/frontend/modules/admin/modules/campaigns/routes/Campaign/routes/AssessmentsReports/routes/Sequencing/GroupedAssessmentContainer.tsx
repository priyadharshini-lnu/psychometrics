import React, { CSSProperties, LegacyRef, RefObject } from 'react'
import {
  Switch, Card, Space, Typography, Button, Tooltip, message, Result, App,
} from 'antd'
import {
  DeleteOutlined, DragOutlined, BlockOutlined, FolderOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { ButtonColorType } from '~/interfaces/Antd'

import { CampaignAssessmentGroup } from '~/modules/admin/modules/campaigns/core/assessmentGroups'

import styles from './styles.less'

const { I18n } = window

type ButtonAttributes = {
  color?: ButtonColorType,
} & Omit<React.HTMLAttributes<HTMLElement>, 'color'>

interface Props {
  group: CampaignAssessmentGroup
  assessmentCount: number
  isLoading: boolean
  children: React.ReactNode
  removeGroup?: (groupId: number) => Promise<{ response: number }>
  updateAssessmentGroups?: (groupId: number) => void
  modifyGroup?: (groupdId: number, data: Partial<CampaignAssessmentGroup>) => void
  sortId?: string
  dragStyle?: CSSProperties
  attributes?: ButtonAttributes
  listeners?: DraggableSyntheticListeners
  ref: LegacyRef<HTMLDivElement>
  style?: CSSProperties
}

export const GroupedAssessmentContainer = React.forwardRef(
  (
    {
      group,
      assessmentCount,
      removeGroup,
      modifyGroup,
      updateAssessmentGroups,
      isLoading,
      children,
      dragStyle,
      attributes,
      listeners,
      style,
    }: Props,
    ref: RefObject<HTMLDivElement>,
  ) => {
    const { modal } = App.useApp()
    const handleDelete = () => {
      modal.confirm({
        title: I18n.t('assessments_reports.sequencing.modal.delete.title'),
        content: I18n.t('assessments_reports.sequencing.modal.delete.text', {
          name: group.name,
        }),
        okText: I18n.t('assessments_reports.sequencing.modal.delete.ok'),
        okType: 'danger',
        cancelText: I18n.t('assessments_reports.sequencing.modal.delete.cancel'),
        onOk: async () => {
          try {
            if (removeGroup && updateAssessmentGroups) {
              const { response } = await removeGroup(group.id)
              updateAssessmentGroups(response)
            }
          } catch (error) {
            message.error(
              I18n.t('assessments_reports.sequencing.modal.delete.failed', {
                name: group.name,
              }),
            )
          }
        },
      })
    }

    const handleTitleChange = (value: string) => {
      if (value) {
        modifyGroup?.(group.id, {
          name: value,
        })
      }
    }

    const handleAssessmentInOrderChange = (checked: boolean) => {
      modifyGroup?.(group.id, {
        previousAssessmentsRequired: checked,
      })
    }

    const handlePrevGroupRequiredChange = (checked: boolean) => {
      modifyGroup?.(group.id, {
        previousGroupRequired: checked,
      })
    }

    return (
      <div ref={ref} style={{ ...style, ...dragStyle }} className="h-100">
        <Card
          className="h-100"
          style={{ minHeight: '380px' }}
          size="small"
          loading={isLoading}
          title={(
            <Space className="w-100">
              <Button
                icon={<DragOutlined />}
                size="small"
                type="text"
                className="cursor-grab"
                {...attributes}
                {...listeners}
              />
              <Typography.Text
                title={group.name}
                className={cs(styles.maxWidth30Chars, styles.editableText)}
                ellipsis
                editable={group.groupType !== 'assessment_center' ? {
                  onChange: handleTitleChange,
                  tooltip: I18n.t('assessments_reports.sequencing.edit_group_name'),
                  triggerType: ['icon', 'text'],
                } : false}
              >
                {group.name}
              </Typography.Text>
            </Space>
          )}
          extra={group.groupType !== 'assessment_center' && (
            <Space>
              <Tooltip title={I18n.t('assessments_reports.sequencing.delete_group')}>
                <Button icon={<DeleteOutlined />} size="small" onClick={handleDelete} type="text" danger />
              </Tooltip>
            </Space>
          )}
        >
          {group.groupType !== 'assessment_center' && (
            <>
              <Card.Meta
                description={(
                  <Space direction="vertical">
                    <Space>
                      <Switch
                        disabled={!assessmentCount}
                        id={`switch_assessment_order-${group.id}`}
                        size="small"
                        checked={!assessmentCount ? false : group.previousAssessmentsRequired}
                        onChange={handleAssessmentInOrderChange}
                      />
                      <label htmlFor={`switch_assessment_order-${group.id}`}>
                        {I18n.t('assessments_reports.add_group_form.previous_assessments_required')}
                      </label>
                    </Space>
                    <Space>
                      <Switch
                        disabled={!assessmentCount}
                        id={`switch_previous_completion-${group.id}`}
                        size="small"
                        checked={!assessmentCount ? false : group.previousGroupRequired}
                        onChange={handlePrevGroupRequiredChange}
                      />
                      <label htmlFor={`switch_previous_completion-${group.id}`}>
                        {I18n.t('assessments_reports.add_group_form.previous_group_required')}
                      </label>
                    </Space>
                  </Space>
            )}
              />

              <Typography.Text type="secondary" className="pb-2 pt-8 flex">
                {I18n.t('assessments_reports.sequencing.assessments')}
              </Typography.Text>

              {assessmentCount ? (
                children
              ) : (
                <Result
                  icon={<BlockOutlined className={styles.iconSecondaryColor} />}
                  subTitle={I18n.t('assessments_reports.sequencing.no_assessments')}
                />
              )}
            </>
          )}
          {group.groupType === 'assessment_center' && (
            <Result
              icon={<FolderOutlined className={styles.iconSecondaryColor} />}
              subTitle={I18n.t('assessments_reports.sequencing.assessment_center_message')}
            />
          )}
        </Card>
      </div>
    )
  },
)
