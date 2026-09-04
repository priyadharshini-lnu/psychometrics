import { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Card, Splitter, Tabs,
} from 'antd'
import type { TabsProps } from 'antd'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  find, last, map, sortBy, compact,
} from 'lodash'
import { RootState } from '~/modules/admin/core/rootReducers'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import store from '~/modules/admin/store'
import { setStore, getStore } from '~/modules/survey/store/StoreWatchman'
import styles from './styles.less'
import AssessorAssessment from './AssessorAssessment'
import Overview from './Overview'
import UserAssessment from './UserAssessment'
import {
  fetchAssessorAssessments, changeAssessorForm, changeSubjectAssessment,
  UserAssessment as UserAssessmentType, AssessorAssessment as AssessorAssessmentType,
} from '../../core/evaluation'

const { I18n, x_navigation_minimize } = window

const connector = connect((state: RootState) => ({
  evaluation: state.assessors.evaluation,
  currentAssessmentId: state.assessors.evaluation.currentAssessmentId,
  currentAssessorFormId: state.assessors.evaluation.currentAssessorFormId,
}), {
  fetchAll: fetchAssessorAssessments,
  changeForm: changeAssessorForm,
  changeSubjectAssessment,
})

interface Props extends ConnectedProps<typeof connector> {}

const Evaluation: FC<Props> = ({
  fetchAll, changeForm, changeSubjectAssessment,
  evaluation: {
    userId: loadedUserId, userInfo, assessorAssessments, subjectAssessments,
  },
  currentAssessmentId, currentAssessorFormId,
}) => {
  let parsedCampaignId; let
    parsedUserId
  const { campaignId, userId } = useParams() as { campaignId: string, userId: string }
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)

  useEffect(() => {
    if (!getStore()) {
      setStore(store)
    }
    fetchAll(parsedCampaignId, parsedUserId)
    if (x_navigation_minimize) {
      x_navigation_minimize('close')
    }
  }, [parsedUserId])

  useEffect(() => {
    const tabId = params.get('tab')
    if (tabId && currentAssessorFormId !== +tabId) {
      changeForm(+tabId)

      const assessorForm = last(assessorAssessments[tabId])
      if (assessorForm?.linked_assessment_id) {
        const userAssessment = find<UserAssessmentType>(
          subjectAssessments, { assessment_id: assessorForm.linked_assessment_id },
        )
        if (userAssessment) {
          changeSubjectAssessment(userAssessment.id)
        }
      }
    }
  }, [assessorAssessments])

  if (loadedUserId !== parsedUserId) {
    return <Card loading variant="borderless" />
  }

  const changeAssessorForm = (id:string) => {
    params.delete('read')
    params.delete('edit')
    params.delete('assessment')

    if (id === 'overview') {
      params.delete('tab')
      navigate(`${location.pathname}?${params.toString()}`, { replace: true })
      changeForm(null)
      return
    }
    params.set('tab', id)
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    changeForm(+id)

    const assessorForm = last(assessorAssessments[id])
    if (assessorForm?.linked_assessment_id) {
      const userAssessment = find<UserAssessmentType>(
        subjectAssessments, { assessment_id: assessorForm.linked_assessment_id },
      )
      if (userAssessment) {
        changeSubjectAssessment(userAssessment.id)
      }
    }
  }

  const changeSubjectForm = (id: string) => {
    changeSubjectAssessment(+id)
  }

  const sortedAssessorAssesments = sortBy(
    map(assessorAssessments, (assessments, id) => ({ id, assessments })), ({ assessments }) => {
      const { name, completed_at } = last<AssessorAssessmentType>(assessments) || {}
      // splitting list in two groups completed and not completed sorted by name
      // ÿ - last ascii character puts completed assessments to the right group
      return completed_at ? `ÿ${name}` : name
    },
  )

  const assessorTabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: I18n.t('admin.assessor_overview'),
      children: <Overview userInfo={userInfo} />,
    },
    ...compact(sortedAssessorAssesments.map(({ assessments, id }) => {
      const assessment = last<AssessorAssessmentType>(assessments)
      if (!assessment) return null
      return {
        key: id,
        label: assessment.name,
        className: 'lh-splitter-fullscreen-wrapper',
        children: (
          <AssessorAssessment
            allowMultipleResponses={assessment.allow_multiple_responses}
            userAssessmentId={+assessment.id}
            assessorAssessments={assessments}
            store={store}
          />
        ),
      }
    })),
  ]

  const subjectTabItems: TabsProps['items'] = subjectAssessments.map(assessment => ({
    key: `${assessment.id}`,
    label: assessment.name,
    className: 'lh-splitter-fullscreen-wrapper',
    children: <UserAssessment subjectAssessmentId={+assessment.id} />,
  }))

  return (
    <div>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: parsedCampaignId },
        }}
        crumbs={[{
          link: () => '/assessors',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
          link: () => `/assessors/campaigns/${campaignId}/users`,
        },
        {
          label: () => userInfo.user?.email,
        },
        ]}
      />
      <Splitter>
        <Splitter.Panel defaultSize="50%" min={300}>
          <Tabs
            activeKey={currentAssessorFormId ? `${currentAssessorFormId}` : 'overview'}
            defaultActiveKey="overview"
            onChange={changeAssessorForm}
            className={styles.assessorTabs}
            items={assessorTabItems}
            animated={false}
            destroyOnHidden
          />
        </Splitter.Panel>
        <Splitter.Panel defaultSize="50%" min={300}>
          {subjectAssessments.length > 0 && (
            <Tabs
              activeKey={`${currentAssessmentId}`}
              onChange={changeSubjectForm}
              className={styles.assessorTabs}
              items={subjectTabItems}
              destroyOnHidden
            />
          )}
        </Splitter.Panel>
      </Splitter>
    </div>
  )
}

export default connector(Evaluation)
