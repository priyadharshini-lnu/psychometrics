import React, { useState } from 'react'
import {
  Progress, Button, Flex, Typography, DatePicker, Divider,
  Tooltip, Empty, Modal,
} from 'antd'
import { useMedia } from 'use-media'
import cs from 'classnames'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Separator } from '~/components/IdpShared/Separator'
import dayjs from '~/utils/dayjs'
import styles from './DevelopmentActionLandscapeCard.less'
import { DevelopmentAction } from '~/components/IdpShared/DevelopmentActions/Types'
import { developmentActionLearningStylesConfig, sourceTypeConfig }
  from '~/components/IdpShared/DevelopmentActions/Constants'


const { RangePicker } = DatePicker

const { I18n } = window

type DevelopmentActionLandscapeCardProps = {
  editMode?: boolean
  onAddDevelopmentAction?: () => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onRemoveDevelopmentAction: (developmentAction: DevelopmentAction) => void
  name: string,
  developmentActions: Partial<DevelopmentAction>[]
  onShowCustomDevelopmentAction?: () => void
  onShowAIGeneratedDevelopmentActions?: () => void
  userIdpSkillId: number
  onRemoveSkill: (userIdpSkillId: number)=>void
  aiAssistantsEnabled: boolean
}

export const DevelopmentActionLandscapeCard:
React.FC<DevelopmentActionLandscapeCardProps> = ({
  name,
  developmentActions,
  editMode,
  onAddDevelopmentAction,
  onUpdateDevelopmentAction,
  onRemoveDevelopmentAction,
  userIdpSkillId,
  onShowCustomDevelopmentAction,
  onShowAIGeneratedDevelopmentActions,
  onRemoveSkill,
  aiAssistantsEnabled,
}) => {
  const [openSkillDeletionModal, setOpenSkillDeletionModal] = useState(false)

  const onDeleteSkill = () => {
    onRemoveSkill(userIdpSkillId)
  }

  const developmentActionCards = developmentActions.map(developmentAction => (
    <Card
      key={developmentAction.id}
      editMode={editMode}
      developmentAction={developmentAction}
      onUpdateDevelopmentAction={onUpdateDevelopmentAction}
      onRemoveDevelopmentAction={onRemoveDevelopmentAction}
    />
  ))

  return (
    <Flex vertical>
      <Flex
        justify="space-between"
      >
        <Flex gap={12} flex={1} justify="space-between" align="center">
          <h4 className={`m-0 self-end ${styles.heading}`}>{name}</h4>
          {editMode && (
            <Tooltip title={I18n.t('admin.idp_remove_skill')}>
              <Button
                type="default"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                className="self-end justify-self-end"
                onClick={() => {
                  setOpenSkillDeletionModal(true)
                }}
              />
            </Tooltip>
          )}
        </Flex>
      </Flex>
      <Separator className="mt-4 mb-0" />
      {!developmentActionCards.length ? (
        <Flex vertical>
          <Flex align="center" className="border-b-1 pt-3 pb-3">
            <Empty description="" style={{ marginInlineStart: '-2rem' }} />
            <Flex vertical align="start" style={{ marginInlineStart: '-2rem' }}>
              <strong className="ta-s">
                {I18n.t('admin.idp_development_actions_no_development_actions')}
              </strong>
              <Typography.Text type="secondary" className="ta-s">
                {I18n.t('admin.idp_development_actions_edit_plan_to_add_development_actions')}
              </Typography.Text>
            </Flex>
          </Flex>
          <Divider className="mb-4 mt-0" />
        </Flex>
      ) : developmentActionCards}
      {editMode ? (
        <Flex gap={64}>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onShowCustomDevelopmentAction}
            className="p-0"
          >
            {I18n.t('admin.idp_development_actions_create_my_own')}
          </Button>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onAddDevelopmentAction}
            className="p-0"
          >
            {I18n.t('admin.idp_development_actions_add_from_library')}
          </Button>
          {aiAssistantsEnabled && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={onShowAIGeneratedDevelopmentActions}
              className="p-0"
            >
              {I18n.t('admin.idp_development_actions_create_from_ai')}
            </Button>
          )}
        </Flex>
      ) : null}
      <Modal
        open={openSkillDeletionModal}
        title=""
        footer={() => (
          <>
            <Button onClick={() => setOpenSkillDeletionModal(false)}>Cancel</Button>
            <Button onClick={onDeleteSkill} danger>Yes, Delete</Button>
          </>
        )}
      >
        <Typography.Text>
          {I18n.t('admin.idp_delete_skill_msg')}
        </Typography.Text>
      </Modal>
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
          disabledDate={current => current && current < dayjs().startOf('day')}
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
  editMode,
  onRemoveDevelopmentAction,
}) => {
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

  const progress = (
    <Flex
      flex={1}
      className={cs(
        {
          'pt-3': !isTablet,
          'pb-2': isTablet,
        },
      )}
    >
      {isTablet ? (
        <Flex flex={1} className={styles.label}>
          {I18n.t('admin.idp_development_actions_completion')}
        </Flex>
      ) : null}
      <Flex
        vertical
        flex={1}
        gap={4}
        justify="space-between"
      >
        <Progress percent={developmentAction.progress} className="mt-1" />

        {editMode && (
          <Tooltip title={I18n.t('idp.development_actions.remove')}>
            <Button
              onClick={() => onRemoveDevelopmentAction(developmentAction)}
              type="default"
              shape="circle"
              icon={<DeleteOutlined />}
              danger
              className="self-end justify-self-end mb-2"
            />
          </Tooltip>
        )
        }
      </Flex>
    </Flex>
  )


  return (
    <Flex vertical>
      <Flex
        align="stretch"
        justify="space-between"
        className="border-b-1"
        vertical={isTablet}
      >
        <Flex
          flex={1}
          className={cs(
            {
              'p-3': !isTablet,
              'pb-2': isTablet,
            },
          )}
          justify="space-between"
          align="center"
        >
          <div
            style={{
              borderLeft:
              `4px solid ${developmentActionLearningStylesConfig[developmentAction.learningStyle].borderColor}`,
            }}
            className="p-3"
          >
            {
              developmentAction.image ? (
                <Flex className={cs('me-4', !(isTablet) ? 'mb-3' : '')}>
                  <img
                    aria-hidden="true"
                    src={developmentAction.image}
                    className={styles.image}
                    alt=""
                  />
                </Flex>
              ) : null
            }
            <Typography.Title
              level={5}
              className="mt-0"
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.developmentActionType === 'course' ? (
                <a href={developmentAction.courseUrl}>
                  {developmentAction.name}
                </a>
              ) : developmentAction.name}
            </Typography.Title>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.description}
            </Typography.Paragraph>
            <Flex>
              {developmentAction.learningStyle
                ? (
                  <Flex gap={4} align="center">
                    <img
                      src={developmentActionLearningStylesConfig[developmentAction.learningStyle].logo}
                    />
                    <strong>
                      {`${developmentActionLearningStylesConfig[developmentAction.learningStyle].duration}%`}
                                                            &nbsp;
                    </strong>
                    <Typography.Text
                      className="font-normal"
                      type="secondary"
                    >
                      {developmentActionLearningStylesConfig[developmentAction.learningStyle].text}
                    </Typography.Text>
                    <Flex gap={4} className="ms-4" align="center">
                      <img
                        src={sourceTypeConfig[developmentAction.sourceType].icon}
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                        }}
                      />
                      <Typography.Text
                        className="font-normal"
                      >
                        {sourceTypeConfig[developmentAction.sourceType].label}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                )
                : null}
            </Flex>
          </div>
        </Flex>
        <Flex flex={1} vertical={isTablet}>
          <Flex
            flex={1}
            justify="flex-start"
            className={cs(
              'p-2',
            )}
          >
            {isTablet ? (
              <Flex flex={1} className={styles.label}>
                {I18n.t('admin.idp_development_actions_date_range')}
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
