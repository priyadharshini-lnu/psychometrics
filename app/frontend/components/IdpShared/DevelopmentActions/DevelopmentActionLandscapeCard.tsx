import React, { useState } from 'react'
import {
  Rate, Progress, Tag, Popover, Button, Slider, Flex, Typography, DatePicker,
} from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from '~/utils/dayjs'
import { Skill } from './DevelopmentActionListView'

import styles from './DevelopmentActionLandscapeCard.less'

const { RangePicker } = DatePicker

const { I18n } = window
interface SkillCardProps extends Skill {
  isEditable?: boolean;
  handleAddDevelopmentAction?: () => void;
}

export const DevelopmentActionLandscapeCard: React.FC<SkillCardProps> = ({
  name,
  rating,
  description,
  durationType,
  durationNumber,
  progress: originalProgress,
  startDate,
  endDate,
  isPrivate,
  isEditable,
  handleAddDevelopmentAction,
}) => {
  const [editableProgress, setEditableProgress] = useState(originalProgress)
  const [editing, setEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleEditClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation()
    setEditing(true)
  }

  const handleProgressChange = (value: number) => {
    setEditableProgress(value)
  }

  const saveProgress = () => {
    setEditing(false)
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditableProgress(originalProgress)
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

  const dateRange = isEditable ? (
    <div>
      <RangePicker />
    </div>
  ) : (
    <Typography.Text>
      {`${dayjs(startDate).format('DD MMM')} - ${dayjs(endDate).format('DD MMM')}`}
    </Typography.Text>
  )

  const header = (
    <>
      <h4 className={styles.m_none}>{name}</h4>
      <Rate disabled defaultValue={rating} />
    </>
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
        vertical
        flex={6}
        gap={4}
        justify="flex-start"
        align="flex-end"
        className={styles.p_12}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Progress percent={editableProgress} className={styles.m_none} />
        {isHovering ? (
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={handleEditClick}
          />
        ) : null}
      </Flex>
    </Popover>
  )

  if (isEditable) {
    return (
      <Flex vertical gap={4}>
        <Flex
          justify="space-between"
          className={`${styles.border_b_1} ${styles.py_12}`}
        >
          <Flex gap={12}>
            {header}
          </Flex>
        </Flex>
        <Flex>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={handleAddDevelopmentAction}
            className={styles.p_none}
          >
            {I18n.t('idp.development_actions.add_development_action')}
          </Button>
        </Flex>
      </Flex>
    )
  }

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
      <Flex
        align="stretch"
        justify="space-between"
        className={styles.border_b_1}
      >
        <Flex
          vertical
          flex={5}
          className={`${styles.border_r_1} ${styles.p_12} ${styles.pl_none}`}
        >
          <Typography.Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
          >
            {description}
          </Typography.Paragraph>
          <Flex gap={8} className={styles.mb_8}>
            <Tag color="geekblue">{durationType}</Tag>
            <Tag>{durationNumber}</Tag>
          </Flex>
        </Flex>
        <Flex flex={5}>
          <Flex
            flex={4}
            justify="flex-start"
            className={`${styles.border_r_1} ${styles.p_12}`}
          >
            {dateRange}
          </Flex>
          <Flex
            flex={3}
            className={`${styles.border_r_1} ${styles.p_12}`}
          >
            {isPrivate
              ? <Typography.Text>{I18n.t('idp.development_actions.action_private')}</Typography.Text>
              : <Typography.Text>{I18n.t('idp.development_actions.action_public')}</Typography.Text>}
          </Flex>
          {progress}
        </Flex>
      </Flex>
      <Flex>
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={handleAddDevelopmentAction}
          className={styles.p_none}
        >
          {I18n.t('idp.development_actions.add_development_action')}
        </Button>
      </Flex>
    </Flex>
  )
}
