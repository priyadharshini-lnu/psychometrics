import React, { useState, useContext } from 'react'
import {
  Rate, Progress, ConfigProvider, Button, Slider, Flex, Typography, DatePicker,
  message,
  Tooltip, Empty, Modal, Popover, Switch, Tag,
  Divider,
} from 'antd'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, InfoCircleOutlined, WarningFilled, MessageOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  MediaQueryContext,
} from '~/glint'
import dayjs from '~/utils/dayjs'
import {
  updateUserIdpSkill,
  removeDevelopmentActionFromPlan,
  saveUserIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import styles from './DevelopmentActionLandscapeCard.less'
import { DevelopmentAction, SkillWithDevelopmentActions, UserIdpSkill } from
  '~/components/IdpShared/DevelopmentActions/Types'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { developmentActionLearningStylesConfig, sourceTypeConfig }
  from '~/components/IdpShared/DevelopmentActions/Constants'
import { DevelopmentActionInfoPopover } from './DevelopmentActionInfoPopover'
import {
  useToggleSkillPrivacyMutation,
} from '~/modules/endUser/modules/campaigns/core/idp/api'

const { RangePicker } = DatePicker

const { I18n } = window

const connector = connect((state: RootState) => ({
  selfRatingEnabled: state.campaigns.idp.selfRatingEnabled,
  idpUser: state.campaigns.idp.user,
  currentUser: state.currentUser,
  userIdpSkills: state.campaigns.idp.userIdpSkills,
  aiAssistantsEnabled: state.config.idp.aiAssistants,
}),
{
  updateUserIdpSkill,
  removeDevelopmentActionFromPlan,
  saveUserIdpSkills,
})

type PropsFromRedux = ConnectedProps<typeof connector>

type SkillCardProps = PropsFromRedux & SkillWithDevelopmentActions & {
  editMode?: boolean
  onAddDevelopmentAction?: () => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => void
  userIdpSkillId: number
  onShowCustomDevelopmentAction?: ()=> void
  onShowAIGeneratedDevelopmentActions?: ()=> void
  isPrivate: boolean
  setSkillForComment:(skillDetails: { skillId: string; skillName: string; } | null)=> void
}

const DevelopmentActionLandscapeCardComponent: React.FC<SkillCardProps> = ({
  name,
  isPrivate,
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
  saveUserIdpSkills,
  userIdpSkills,
  onShowCustomDevelopmentAction,
  onShowAIGeneratedDevelopmentActions,
  setSkillForComment,
  aiAssistantsEnabled,
}) => {
  const [toggleSkillPrivacy] = useToggleSkillPrivacyMutation()
  const isCurrentUserIDPUser = currentUser.id === idpUser.id

  const [isPrivateSkill, setPrivateSkill] = useState(isPrivate)

  const { isTablet, isDesktop } = useContext(MediaQueryContext)


  const [openSkillDeletionModal, setOpenSkillDeletionModal] = useState(false)
  const handleRatingChange = (rating) => {
    updateUserIdpSkill(userIdpSkillId, { initialRating: rating }, idpUser.id).catch((error) => {
      message.error(error || I18n.t('common.errors.something_wrong'))
    })
  }

  const onRemoveSkill = () => {
    saveUserIdpSkills(Object.values(userIdpSkills)
      .filter((skill: UserIdpSkill) => skill.id !== userIdpSkillId)).then(() => {
      setOpenSkillDeletionModal(false)
    })
  }

  const updateSkillPrivacy = () => {
    toggleSkillPrivacy({ userIdpSkillId }).then((res) => {
      message.success(res?.data?.message)
      setPrivateSkill(!isPrivateSkill)
    }).catch((res) => {
      message.error(res?.data?.message)
    })
  }

  const header = (
    <Flex>
      <Flex vertical={isTablet || isDesktop} gap={4} align={isTablet || isDesktop ? 'start' : 'center'}>
        <h4 className="m-0 ms-1 me-1 mt-2">{name}</h4>
        {
        selfRatingEnabled
        && (
          <Rate
            disabled={!editMode}
            onChange={handleRatingChange}
            defaultValue={finalRating || initialRating}
            className="mt-2"
          />
        )
      }
        {isCurrentUserIDPUser && (
          editMode ? (
            <Switch
              checkedChildren="Private"
              unCheckedChildren="Public"
              value={isPrivateSkill}
              onChange={updateSkillPrivacy}
              className={cs('mt-2', isTablet ? '' : 'ms-4')}
              style={{
                width: '80px',
              }}
            />
          ) : (
            isPrivateSkill && (
              <Tag
                className={isTablet || isDesktop ? 'self-start' : 'self-start'}
                color="var(--ant-primary-color)"
              >
                Private
              </Tag>
            )
          ))}
      </Flex>
    </Flex>
  )

  const developmentActionCards = developmentActions.map(developmentAction => (
    <Card
      key={developmentAction.id}
      editMode={editMode}
      developmentAction={developmentAction}
      onUpdateDevelopmentAction={onUpdateDevelopmentAction}
      onUpdateDevelopmentActionProgress={onUpdateDevelopmentActionProgress}
      onRemoveDevelopmentAction={removeDevelopmentActionFromPlan}
      canEditProgress={isCurrentUserIDPUser}
    />
  ))

  return (
    <Flex vertical id={`skill-${userIdpSkillId}`}>
      <Flex
        justify="space-between"
        className="pt-3 pb-3 border-b-1"
        align="center"
      >
        <Flex gap={12}>
          {header}
        </Flex>
        <Flex className="self-start">
          <Button
            type="text"
            onClick={() => setSkillForComment({ skillId: userIdpSkillId.toString(), skillName: name })}
            icon={<MessageOutlined />}
          />
          {editMode && (
            <Tooltip title={I18n.t('idp.remove_skill')}>
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
      {!developmentActionCards.length ? (
        <Flex vertical>
          <Flex wrap align="center" className="border-b-1 pt-3 pb-3">
            <Empty description="" style={!isTablet ? { marginInlineStart: '-2rem' } : {}} />
            <Flex vertical align="start" style={!isTablet ? { marginInlineStart: '-2rem' } : {}}>
              <strong className="ta-s">
                {I18n.t('idp.development_actions.no_development_actions')}
              </strong>
              {!editMode ? (
                <Typography.Text type="secondary" className="ta-s">
                  {I18n.t('idp.development_actions.edit_plan_to_add_development_actions')}
                </Typography.Text>
              ) : (
                <Flex gap={4}>
                  <Typography.Text type="secondary" className="ta-s">
                    {I18n.t('idp.development_actions.add_development_actions_from_below_options')}
                  </Typography.Text>
                  <Popover
                    placement="bottom"
                    title={(
                      <span className="p-4">
                        {I18n.t('idp.development_actions.info_popover_title')}
                      </span>
                    )}
                    content={<DevelopmentActionInfoPopover />}
                  >
                    {!(isTablet || isDesktop) && (
                      <Button
                        style={{
                          height: '1.4rem',
                          width: '1rem',
                        }}
                        type="link"
                        className="p-0 mb-1"
                        icon={<InfoCircleOutlined />}
                      />
                    )}
                  </Popover>
                </Flex>
              )}
            </Flex>
          </Flex>
          <Divider className="mb-0 mt-0" />
        </Flex>
      ) : developmentActionCards}
      {editMode ? (
        <Flex className="mt-4" gap={isTablet ? 8 : 64} vertical={isTablet} justify="start">
          {isTablet && (
            <Flex>
              <Typography.Text>{I18n.t('idp.development_actions.add_more')}</Typography.Text>
              <Popover
                placement="bottom"
                title={(
                  <span className="p-4">
                    {I18n.t('idp.development_actions.info_popover_title')}
                  </span>
                    )}
                content={<DevelopmentActionInfoPopover />}
              >
                <Button
                  style={{
                    height: '1.6rem',
                  }}
                  type="link"
                  className="p-0"
                  icon={<InfoCircleOutlined />}
                />
              </Popover>
            </Flex>
          )}
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onShowCustomDevelopmentAction}
            className="p-0 self-start"
          >
            {I18n.t('idp.development_actions.create_my_own')}
          </Button>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onAddDevelopmentAction}
            className="p-0 self-start"
          >
            {I18n.t('idp.development_actions.add_from_library')}
          </Button>
          {aiAssistantsEnabled && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={onShowAIGeneratedDevelopmentActions}
              className="p-0 self-start"
            >
              {I18n.t('idp.development_actions.create_from_ai')}
            </Button>
          )}
        </Flex>
      ) : null}
      <Modal
        open={openSkillDeletionModal}
        title=""
        footer={() => (
          <>
            <Button onClick={() => setOpenSkillDeletionModal(false)}>{I18n.t('common.actions.cancel')}</Button>
            <Button onClick={onRemoveSkill} danger>{I18n.t('common.actions.yes_delete')}</Button>
          </>
        )}
      >
        <Flex vertical align="center">
          <WarningFilled
            alt="Warning"
            className={cs(styles.warningIcon, 'mb-2')}
          />
          <strong className="ta-c">
            {I18n.t('idp.delete_skill')}
          </strong>
        </Flex>

      </Modal>
    </Flex>
  )
}

const DateRange = ({ developmentAction, editMode, onDateRangeChange }) => {
  const { startDateTime, endDateTime } = developmentAction
  const format = 'DD MMM YYYY'

  const { isTablet } = useContext(MediaQueryContext)

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
          showTime={isTablet}
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

  const { isTablet, isDesktop } = useContext(MediaQueryContext)


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

  const progress = (
    <Flex
      flex={1}
      className={cs(
        {
          'p-3 pe-0': !(isTablet || isDesktop),
          'pb-2': isTablet || isDesktop,
        },
      )}
      vertical={isTablet || isDesktop}
    >
      {isTablet || isDesktop ? (
        <Flex flex={1} className={styles.label}>
          {I18n.t('idp.development_actions.completion')}
        </Flex>
      ) : null}
      <Flex
        vertical
        flex={1}
        gap={4}
        justify="space-between"
      >
        <Flex gap={8}>
          {!editing && (
            <Progress
              percent={editableProgress}
              className="mt-1"
              style={isTablet || isDesktop ? { width: '80%' } : {}}
            />
          )}
          {
            !editMode && !editing && canEditProgress ? (
              <Tooltip title={I18n.t('idp.development_actions.edit_da_progress')}>
                <Button
                  type="default"
                  className="border-none mb-1"
                  icon={<EditOutlined />}
                  onClick={handleEditClick}
                />
              </Tooltip>

            ) : null}
        </Flex>
        {editing && (
          <Flex vertical>
            <ConfigProvider
              theme={{
                components: {
                  Slider: {
                    trackBg: '#0B0B0B',
                    trackHoverBg: '#0B0B0B',
                    railSize: 8,
                    controlSize: 5,
                    handleColor: '#0B0B0B',
                    handleActiveColor: '#0B0B0B',
                  },
                },
              }}
            >
              <Slider
                min={0}
                max={100}
                value={editableProgress}
                onChange={handleProgressChange}
                tooltip={{
                  formatter: value => `${value}%`,
                }}
                styles={{
                  rail: {
                    borderRadius: '20px',
                  },
                  track: {
                    borderRadius: '20px',
                  },
                }}
                className="m-0"
              />
            </ConfigProvider>

            <Flex className="mt-1" gap={8} justify="flex-end">
              <Button size="small" onClick={cancelEditing}>{I18n.t('common.actions.cancel')}</Button>
              <Button type="primary" size="small" onClick={saveProgress}>{I18n.t('common.actions.save')}</Button>
            </Flex>
          </Flex>
        )}
        {
            editMode && (
              <Tooltip title={I18n.t('idp.development_actions.remove')}>
                <Button
                  onClick={() => onRemoveDevelopmentAction(developmentAction)}
                  type="default"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                  className="self-end justify-self-end"
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
        vertical={isTablet || isDesktop}
        style={isTablet || isDesktop ? {
          borderInlineStart:
              `4px solid ${developmentActionLearningStylesConfig[developmentAction.learningStyle].borderColor}`,
        } : {}}
      >
        <Flex
          flex={1}
          className={cs(
            {
              'p-3': !(isTablet || isDesktop),
              'pb-2': isTablet || isDesktop,
            },
          )}
          justify="space-between"
          align="center"

        >
          <div
            className="p-3"
            style={!(isTablet || isDesktop) ? {
              borderInlineStart:
              `4px solid ${developmentActionLearningStylesConfig[developmentAction.learningStyle].borderColor}`,
            } : {}}
          >
            <Typography.Title
              level={5}
              className="mt-0"
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.name}
            </Typography.Title>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.description || developmentAction.customAction}
            </Typography.Paragraph>
            <Flex>
              {developmentAction.learningStyle
                ? (
                  <Flex vertical={isTablet || isDesktop} gap={4} align="center">
                    <Flex align="center" className="me-4">
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
                    </Flex>

                    <Flex gap={4} align="center" className={cs(isTablet || isDesktop ? 'self-start' : '', 'ms-2')}>
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
        <Flex flex={1} vertical={isTablet || isDesktop} className={isTablet || isDesktop ? 'p-4 pt-0 pe-0' : ''}>
          <Flex
            flex={1}
            justify="flex-start"
            className={cs(
              isTablet || isDesktop ? 'mb-4' : 'pt-4',
            )}
            vertical={isTablet || isDesktop}
          >
            {isTablet || isDesktop ? (
              <Flex
                flex={1}
                className={cs(
                  isTablet || isDesktop ? 'mb-1' : '',
                  styles.label,
                )}
              >
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
