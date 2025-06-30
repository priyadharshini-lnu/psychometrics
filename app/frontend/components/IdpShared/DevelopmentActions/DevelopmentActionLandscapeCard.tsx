import React, { useState } from 'react'
import {
  Rate, Progress, Popover, Button, Slider, Flex, Typography, DatePicker,
  message,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined, EditOutlined, PlusOutlined,
} from '@ant-design/icons'
import useMedia from 'use-media'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import dayjs from '~/utils/dayjs'
import {
  updateUserIdpSkill,
  removeDevelopmentActionFromPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import styles from './DevelopmentActionLandscapeCard.less'
import { DevelopmentAction, SkillWithDevelopmentActions } from './Types'
import { Tags } from './Common'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { SkillCommentsPopover } from './SkillCommentPopover'

const { RangePicker } = DatePicker

const { I18n } = window

const connector = connect((state: RootState) => ({
  selfRatingEnabled: state.campaigns.idp.selfRatingEnabled,
  idpUser: state.campaigns.idp.user,
  currentUser: state.currentUser,
}),
{
  updateUserIdpSkill,
  removeDevelopmentActionFromPlan,
})

type PropsFromRedux = ConnectedProps<typeof connector>

type SkillCardProps = PropsFromRedux & SkillWithDevelopmentActions & {
  editMode?: boolean
  onAddDevelopmentAction?: () => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => void
  userIdpSkillId: number
}

const DevelopmentActionLandscapeCardComponent: React.FC<SkillCardProps> = ({
  name,
  initialRating,
  finalRating,
  userIdpSkillId,
  developmentActions,
  editMode,
  onAddDevelopmentAction,
  onUpdateDevelopmentAction,
  onUpdateDevelopmentActionProgress,
  updateUserIdpSkill,
  selfRatingEnabled,
  removeDevelopmentActionFromPlan,
  idpUser, currentUser,
}) => {
  const canEditProgress = currentUser.id === idpUser.id

  const handleRatingChange = (rating) => {
    updateUserIdpSkill(userIdpSkillId, { initialRating: rating }, idpUser.id).catch((error) => {
      message.error(error || I18n.t('common.errors.something_wrong'))
    })
  }

  const header = (
    <>
      <h4 className={styles.m_none}>{name}</h4>
      {
        selfRatingEnabled
        && (
          <Rate
            disabled={!editMode}
            onChange={handleRatingChange}
            defaultValue={finalRating || initialRating}
          />
        )
      }
    </>
  )

  const developmentActionCards = developmentActions.map(developmentAction => (
    <Card
      key={developmentAction.id}
      editMode={editMode}
      developmentAction={developmentAction}
      onUpdateDevelopmentAction={onUpdateDevelopmentAction}
      onUpdateDevelopmentActionProgress={onUpdateDevelopmentActionProgress}
      onRemoveDevelopmentAction={removeDevelopmentActionFromPlan}
      canEditProgress={canEditProgress}
    />
  ))

  return (
    <Flex vertical id={`skill-${userIdpSkillId}`}>
      <Flex
        justify="space-between"
        className={`${styles.border_b_1} ${styles.py_12}`}
      >
        <Flex gap={12}>
          {header}
        </Flex>
        <SkillCommentsPopover
          skillId={userIdpSkillId.toString()}
          skillName={name}
        />
      </Flex>
      {developmentActionCards}
      {editMode ? (
        <Flex>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onAddDevelopmentAction}
            className={styles.p_none}
          >
            {I18n.t('idp.development_actions.add_development_action')}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}

const DateRange = ({ developmentAction, editMode, onDateRangeChange }) => {
  const { startDateTime, endDateTime } = developmentAction
  const format = 'DD MMM YYYY'
  if (editMode) {
    return (
      <Flex flex={1} vertical>
        <RangePicker
          defaultValue={[
            startDateTime ? dayjs(startDateTime) : null,
            endDateTime ? dayjs(endDateTime) : null,
          ]}
          format={format}
          onChange={onDateRangeChange}
        />
      </Flex>
    )
  }
  if (startDateTime && endDateTime) {
    return (
      <Flex flex={1}>
        <Typography.Text>
          {`${dayjs(startDateTime).format('DD MMM YYYY')} -
      ${dayjs(endDateTime).format('DD MMM YYYY')}`}
        </Typography.Text>
      </Flex>
    )
  }
  return (<Flex flex={1}>-</Flex>)
}

const Card = ({
  developmentAction,
  onUpdateDevelopmentAction,
  onUpdateDevelopmentActionProgress,
  editMode,
  onRemoveDevelopmentAction,
  canEditProgress,
}) => {
  const [editableProgress, setEditableProgress] = useState(developmentAction.progress)
  const [editing, setEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const isTablet = useMedia({
    maxWidth: 768,
  })

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | undefined) => {
    const [start, end] = dates || []
    onUpdateDevelopmentAction?.({
      ...developmentAction,
      startDateTime: start ? dayjs(start).format('YYYY-MM-DD HH:mm') : null,
      endDateTime: end ? dayjs(end).format('YYYY-MM-DD HH:mm') : null,
    })
  }

  const handleEditClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation()
    setEditing(true)
  }

  const handleProgressChange = (value: number) => {
    setEditableProgress(value)
  }

  const saveProgress = () => {
    setEditing(false)
    if (editMode) {
      onUpdateDevelopmentAction({
        ...developmentAction,
        progress: editableProgress,
      })
    } else {
      onUpdateDevelopmentActionProgress({ id: developmentAction.id, progress: editableProgress })
    }
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditableProgress(developmentAction.progress)
  }

  const popoverContent = (
    <Flex vertical>
      <Slider
        min={0}
        max={100}
        value={editableProgress}
        onChange={handleProgressChange}
        tooltip={{
          formatter: value => `${value}%`,
        }}
      />
      <Flex gap={8} justify="flex-end">
        <Button size="small" onClick={cancelEditing}>Cancel</Button>
        <Button type="primary" size="small" onClick={saveProgress}>Save</Button>
      </Flex>
    </Flex>
  )

  const progress = (
    <Popover
      content={popoverContent}
      title="Edit Progress"
      trigger="click"
      open={canEditProgress && editing}
      onOpenChange={setEditing}
    >
      <Flex
        flex={6}
        className={cs(
          {
            [styles.p_12]: !isTablet,
            [styles.pb_8]: isTablet,
          },
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isTablet ? (
          <Flex flex={1} className={styles.label}>
            {I18n.t('idp.development_actions.completion')}
          </Flex>
        ) : null}
        <Flex
          vertical
          flex={1}
          gap={4}
          justify="flex-start"
          align="flex-end"
        >
          <Progress percent={editableProgress} className={styles.m_none} />
          {canEditProgress && (isHovering || isTablet) ? (
            <Button
              type="default"
              shape="circle"
              icon={<EditOutlined />}
              onClick={handleEditClick}
            />
          ) : null}
        </Flex>
      </Flex>
    </Popover>
  )

  return (
    <Flex vertical>
      <Flex
        align="stretch"
        justify="space-between"
        className={styles.border_b_1}
        vertical={isTablet}
      >
        <Flex
          flex={5}
          className={cs(
            {
              [styles.border_r_1]: !isTablet,
              [styles.p_12]: !isTablet,
              [styles.pl_none]: !isTablet,
              [styles.pb_8]: isTablet,
            },
          )}
          justify="space-between"
          align="center"
        >
          <div>
            <Typography.Title
              level={5}
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.name}
            </Typography.Title>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.description || developmentAction.customAction}
            </Typography.Paragraph>
            <Flex className={styles.mb_8}>
              {developmentAction.learningStyle || developmentAction.customActionLearningStyle
                ? <Tags type={developmentAction.learningStyle || developmentAction.customActionLearningStyle} />
                : null}
            </Flex>
          </div>
          {
            editMode && (
              <Tooltip title={I18n.t('idp.development_actions.remove')}>
                <Button
                  onClick={() => onRemoveDevelopmentAction(developmentAction)}
                  type="default"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            )
          }
        </Flex>
        <Flex flex={5} vertical={isTablet}>
          <Flex
            flex={9}
            justify="flex-start"
            className={cs(
              {
                [styles.border_r_1]: !isTablet,
                [styles.p_12]: !isTablet,
                [styles.pb_8]: isTablet,
              },
            )}
          >
            {isTablet ? (
              <Flex flex={1} className={styles.label}>
                {I18n.t('idp.development_actions.date_range')}
              </Flex>
            ) : null}
            <DateRange
              onDateRangeChange={handleDateRangeChange}
              developmentAction={developmentAction}
              editMode={editMode}
            />
          </Flex>
          {progress}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const DevelopmentActionLandscapeCard = connector(DevelopmentActionLandscapeCardComponent)
