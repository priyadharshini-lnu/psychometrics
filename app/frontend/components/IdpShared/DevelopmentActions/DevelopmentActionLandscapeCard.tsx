import React, { useState } from 'react'
import {
  Rate, Progress, Popover, Button, Slider, Flex, Typography, DatePicker,
  Switch,
} from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import useMedia from 'use-media'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'

import styles from './DevelopmentActionLandscapeCard.less'
import { DevelopmentAction, SkillWithDevelopmentActions } from '.'
import { Tags } from './Tags'

const { RangePicker } = DatePicker

const { I18n } = window
type SkillCardProps = SkillWithDevelopmentActions & {
  editMode?: boolean
  onAddDevelopmentAction?: () => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => void
}

export const DevelopmentActionLandscapeCard: React.FC<SkillCardProps> = ({
  name,
  initialRating,
  finalRating,
  developmentActions,
  editMode,
  onAddDevelopmentAction,
  onUpdateDevelopmentAction,
  onUpdateDevelopmentActionProgress,
}) => {
  const header = (
    <>
      <h4 className={styles.m_none}>{name}</h4>
      <Rate disabled defaultValue={finalRating || initialRating} />
    </>
  )

  const developmentActionCards = developmentActions.map(developmentAction => (
    <Card
      key={developmentAction.id}
      editMode={editMode}
      developmentAction={developmentAction}
      onUpdateDevelopmentAction={onUpdateDevelopmentAction}
      onUpdateDevelopmentActionProgress={onUpdateDevelopmentActionProgress}
    />
  ))

  return (
    <Flex vertical>
      <Flex
        justify="space-between"
        className={`${styles.border_b_1} ${styles.py_12}`}
      >
        <Flex gap={12}>
          {header}
        </Flex>
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

  const handlePrivacyChange = (checked: boolean) => {
    onUpdateDevelopmentAction?.({
      ...developmentAction,
      private: checked,
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
      open={editing}
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
          {isHovering || isTablet ? (
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
          vertical
          flex={5}
          className={cs(
            {
              [styles.border_r_1]: !isTablet,
              [styles.p_12]: !isTablet,
              [styles.pl_none]: !isTablet,
              [styles.pb_8]: isTablet,
            },
          )}
        >
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
            {developmentAction.learningStyle ? <Tags type={developmentAction.learningStyle} /> : null}
          </Flex>
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
          <Flex
            flex={3}
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
                {I18n.t('idp.development_actions.private')}
              </Flex>
            ) : null}
            <Flex flex={1}>
              {!editMode && (developmentAction.private
                ? (<Typography.Text>{I18n.t('idp.development_actions.action_private')}</Typography.Text>)
                : (<Typography.Text>{I18n.t('idp.development_actions.action_public')}</Typography.Text>)
              )}
            </Flex>
            {editMode ? (
              <Switch
                defaultChecked={developmentAction.private}
                size="small"
                onChange={handlePrivacyChange}
              />
            ) : null}
          </Flex>
          {progress}
        </Flex>
      </Flex>
    </Flex>
  )
}
