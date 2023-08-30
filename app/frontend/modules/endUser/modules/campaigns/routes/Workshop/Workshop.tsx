import { useEffect, FC } from 'react'
import {
  Col, Layout, Row, Typography,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchEndUserWorkshop } from '~/modules/endUser/modules/campaigns/core/workshops'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { ViewsContainer } from '~/glint'
import styles from './styles.less'
import { WorkshopPageHeader } from './PageHeader'
import { MeetingLink } from './MeetingLink'
import { AssessmentCard } from './AssessmentCard'

const { Content } = Layout
const { I18n } = window
const { Title } = Typography

const connector = connect(
  (state: RootState) => ({
    workshop: state.campaigns.workshop,
  }),
  { fetchEndUserWorkshop },
)
type PropsFromRedux = ConnectedProps<typeof connector>

const WorkshopComponent: FC<PropsFromRedux> = ({ workshop, fetchEndUserWorkshop }) => {
  const { workshopId } = useParams<{ workshopId: string }>()

  useEffect(() => { fetchEndUserWorkshop(workshopId) }, [])

  if (!workshop) return <PageContentSkeleton />
  return (
    <>
      <Content>
        <WorkshopPageHeader />

        {workshop.meetingLink && (
          <MeetingLink meetingLink={workshop.meetingLink} />)
        }

        <div className={styles.activitiesContent}>
          <ViewsContainer
            title={I18n.t('campaign_assessment.assessments_heading')}
            defaultView="grid"
          >
            {(view) => {
              let tabCol = 12
              let deskCol = 8
              if (view === 'list') {
                tabCol = 24
                deskCol = 24
              }
              return (
                <>
                  {workshop.preworks?.length > 0 && (
                    <div className={styles.group}>
                      <Title level={5}>
                        {I18n.t('campaign.workshops.preworks')}
                      </Title>
                      <Row gutter={[16, 16]}>
                        {workshop.preworks.map(prework => (
                          <Col xs={24} sm={24} md={24} lg={tabCol} xl={deskCol} key={prework.id}>
                            <AssessmentCard assessment={prework} view={view} workshop={workshop} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {workshop.activities?.length > 0 && (
                    <div className={styles.group}>
                      <Title level={5}>
                        {I18n.t('campaign.workshops.activities')}
                      </Title>
                      <Row gutter={[16, 16]}>
                        {workshop.activities.map(activity => (
                          <Col xs={24} sm={24} md={24} lg={tabCol} xl={deskCol} key={activity.id}>
                            <AssessmentCard assessment={activity} view={view} workshop={workshop} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </>
              )
            }}
          </ViewsContainer>
        </div>
      </Content>
    </>
  )
}

export const Workshop = connector(WorkshopComponent)
