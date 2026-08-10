import { FC, ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PageContainer,
  PageHeader,
  Tabs,
  ProgramCard,
  Empty,
  Card,
  Tag,
  Button,
  Typography,
  Flex,
  Row,
  Col,
  Avatar,
  Divider,
  useBreakpoint,
} from '@thetalententerprise/glint'
import type { ProgramMeta } from '@thetalententerprise/glint'
import { SafeHTML } from '~/components/SafeHTML'
import {
  mapProgramDetails,
  isProgramTab,
  type ProgramCampaign,
  type ProgramTab,
  type StatusTone,
  type ExerciseSectionModel,
  type AssessmentCenterModel,
} from './mapProgramDetails'
import { ExerciseCardItem } from './ExerciseCardItem'

const { I18n } = window

const TONE_COLOR: Record<StatusTone, string> = {
  completed: 'green',
  in_progress: 'blue',
  not_started: 'default',
}

export type ProgramDetailsContentProps = {
  campaign: ProgramCampaign
}

const Section: FC<{ section?: ExerciseSectionModel }> = ({ section }) => {
  const screens = useBreakpoint()
  if (!section) return null
  // Cards per row mirrors the Col spans below; connectors only bridge numbers
  // that share a row, so nothing dangles at a wrap.
  let perRow = 1
  if (screens.xl) perRow = 3
  else if (screens.md) perRow = 2
  return (
    <Flex vertical gap="middle">
      <Flex vertical gap="small">
        <Typography.Title level={3} style={{ margin: 0 }}>{section.heading}</Typography.Title>
        <Typography.Text type="secondary">{section.hint}</Typography.Text>
      </Flex>
      {section.groups.map((group, groupIndex) => {
        const currentStep = group.cards.findIndex(card => card.status !== 'completed')
        return (

          <Flex vertical gap="middle" key={group.name ?? groupIndex}>
            {group.name ? (
              <Flex align="baseline" gap="small" wrap>
                <Typography.Title level={4} style={{ margin: 0 }}>{group.name}</Typography.Title>
                {group.hint ? <Typography.Text type="secondary">{group.hint}</Typography.Text> : null}
              </Flex>
            ) : null}
            <Row gutter={[20, 20]}>
              {group.cards.map((card, index) => (
                <Col key={card.key} xs={24} md={12} xl={8}>
                  <Flex vertical gap="middle" style={{ blockSize: '100%' }}>
                    {section.sequential && group.cards.length > 1 ? (
                      <Flex align="center" gap="small">
                        <Avatar
                          size="small"
                          style={index === currentStep
                            ? {
                              background: 'var(--ant-color-primary)',
                              color: 'var(--ant-color-text-light-solid)',
                              flexShrink: 0,
                            }
                            : {
                              background: 'var(--ant-color-fill-secondary)',
                              color: 'var(--ant-color-text-secondary)',
                              flexShrink: 0,
                            }}
                        >
                          {index + 1}
                        </Avatar>
                        {index < group.cards.length - 1 && (index + 1) % perRow !== 0
                          ? <Divider style={{ margin: 0, minInlineSize: 0, flex: 1 }} />
                          : null}
                      </Flex>
                    ) : null}
                    <ExerciseCardItem model={card} />
                  </Flex>
                </Col>
              ))}
            </Row>
          </Flex>
        )
      })}
    </Flex>
  )
}

const AC_STATE_TAG: Record<AssessmentCenterModel['state'], { label: () => string; color: string }> = {
  invite: { label: () => I18n.t('frontend.bookings.reserve_spot'), color: 'blue' },
  reserved: { label: () => I18n.t('enduser.details_reserved'), color: 'gold' },
  done: { label: () => I18n.t('campaign_assessment.statuses.completed'), color: 'green' },
  locked: { label: () => I18n.t('enduser.status_locked'), color: 'default' },
}

// Program-details content: PageHeader (serif title + status/stat chips) and the
// intro / tasks / reports Tabs, composed on glint primitives. Data comes from
// `mapProgramDetails` (pure); the page chrome is composed by ProgramDetailsPage.
export const ProgramDetailsContent: FC<ProgramDetailsContentProps> = ({ campaign }) => {
  const navigate = useNavigate()
  const model = mapProgramDetails(campaign)
  const [activeTab, setActiveTab] = useState<ProgramTab>(model.hasIntro ? 'intro' : 'tasks')

  const ac = model.assessmentCenter
  const assessmentCenter = ac ? (() => {
    const stateTag = AC_STATE_TAG[ac.state]
    const meta: ProgramMeta[] = []
    if (ac.durationLabel) meta.push({ label: ac.durationLabel })
    if (ac.proctored) meta.push({ label: I18n.t('enduser.proctored') })
    // The reserve/schedule flow stays legacy: the swap seam skips campaign URLs carrying
    // an assessmentCenterId query, so this lands on the legacy campaign page.
    const toDetail = () => navigate(`/campaigns/${campaign.id}?assessmentCenterId=${ac.groupId}`)
    return (
      <ProgramCard
        title={ac.name}
        description={ac.description}
        meta={meta}
        tag={<Tag color={stateTag.color}>{stateTag.label()}</Tag>}
        actions={ac.state !== 'locked' ? (
          <Button scheme="primary" variant="solid" onClick={toDetail}>
            {ac.state === 'invite'
              ? I18n.t('frontend.bookings.reserve_spot')
              : I18n.t('enduser.details_view_details')}
          </Button>
        ) : undefined}
      />
    )
  })() : null

  const intro = model.hasIntro && model.instructions ? (
    <SafeHTML html={model.instructions} config="adminRichText" />
  ) : null

  const reports = model.reportsAvailable ? (
    <Card>
      <Flex vertical gap="middle" align="flex-start">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {I18n.t('enduser.details_reports_ready')}
        </Typography.Title>
        <Button scheme="primary" variant="solid" onClick={() => navigate(`/campaigns/${campaign.id}/insights`)}>
          {I18n.t('campaign.insights_reports')}
        </Button>
      </Flex>
    </Card>
  ) : (
    <Empty description={I18n.t('enduser.details_no_reports')} />
  )

  const tabContent: Record<ProgramTab, ReactNode> = {
    intro,
    tasks: (
      <Flex vertical gap="large">
        {assessmentCenter}
        <Section section={model.sequential} />
        <Section section={model.open} />
      </Flex>
    ),
    reports,
  }

  const items = model.tabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    children: tabContent[tab.key],
  }))

  return (
    <>
      <title>{`${model.title} - ${I18n.t('frontend.lighthouse_app')}`}</title>
      <PageContainer>
        <Flex vertical gap="large">
          <PageHeader
            accent
            title={model.title}
            tag={(
              <Tag color={TONE_COLOR[model.status.tone]}>
                {model.status.label}
              </Tag>
            )}
            meta={model.stats.map(stat => (
              <Tag key={stat.label} color={stat.color}>{stat.label}</Tag>
            ))}
          />
          <Tabs
            items={items}
            activeKey={activeTab}
            onChange={(key) => { if (isProgramTab(key)) setActiveTab(key) }}
          />
        </Flex>
      </PageContainer>
    </>
  )
}

export default ProgramDetailsContent
