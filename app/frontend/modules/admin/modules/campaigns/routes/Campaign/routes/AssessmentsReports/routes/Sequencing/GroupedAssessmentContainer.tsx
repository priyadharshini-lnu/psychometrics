import React, {
  CSSProperties, FC,
} from 'react'
import {
  Switch, Card, Space, Typography, Button, Tooltip, message, Result, App, Badge,
} from 'antd'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import {
  DeleteOutlined, DragOutlined, BlockOutlined, EditOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
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
  onManageTranslations?: () => void
  dragStyle?: CSSProperties
  attributes?: ButtonAttributes
  listeners?: DraggableSyntheticListeners
  style?: CSSProperties
}

export const GroupedAssessmentContainer = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      group,
      assessmentCount,
      removeGroup,
      modifyGroup,
      updateAssessmentGroups,
      onManageTranslations,
      isLoading,
      children,
      dragStyle,
      attributes,
      listeners,
      style,
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>,
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
              error || I18n.t('assessments_reports.sequencing.modal.delete.failed', {
                name: group.name,
              }),
            )
          }
        },
      })
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

    const handlePreviousGroupsCompletionForBookingChange = (checked: boolean) => {
      modifyGroup?.(group.id, {
        requirePreviousGroupsCompletionForBooking: checked,
      })
    }

    return (
      <div ref={ref} style={{ ...style, ...dragStyle }} className="h-100">
        <BadgeWrapper groupType={group.groupType}>
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
                  className={styles.maxWidth30Chars}
                  ellipsis
                >
                  {group.name}
                </Typography.Text>
                <Tooltip title={I18n.t('assessments_reports.sequencing.edit_group_name')}>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    type="text"
                    onClick={() => onManageTranslations?.()}
                  />
                </Tooltip>
              </Space>
            )}
            extra={(
              <Space>
                <Tooltip title={I18n.t('assessments_reports.sequencing.delete_group')}>
                  <Button icon={<DeleteOutlined />} size="small" onClick={handleDelete} type="text" danger />
                </Tooltip>
              </Space>
            )}
          >
            <>
              <Card.Meta
                description={(
                  <Space orientation="vertical">
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
                    {(group.groupType === 'assessment_center') && (
                      <Space>
                        <Switch
                          disabled={!assessmentCount}
                          id={`require_previous_groups_completion_for_booking-${group.id}`}
                          size="small"
                          checked={!assessmentCount ? false : group.requirePreviousGroupsCompletionForBooking}
                          onChange={handlePreviousGroupsCompletionForBookingChange}
                        />
                        <label htmlFor={`require_previous_groups_completion_for_booking-${group.id}`}>
                          {I18n.t('assessments_reports.add_group_form.require_previous_groups_completion_for_booking')}
                        </label>
                      </Space>
                    )}
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
          </Card>
        </BadgeWrapper>
      </div>
    )
  },
)

type BadgeWrapperProps = {
  groupType: string
  children: React.ReactNode
}

const BadgeWrapper: FC<BadgeWrapperProps> = ({ groupType, children }) => {
  if (groupType === 'assessment_center') {
    return (
      <Badge.Ribbon
        text={I18n.t('frontend.bookings.assessment_center_group_name')}
        className={styles.badge}
      >
        {children}
      </Badge.Ribbon>
    )
  }

  return <>{children}</>
}
