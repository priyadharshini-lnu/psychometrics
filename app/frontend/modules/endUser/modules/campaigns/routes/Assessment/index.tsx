import { useEffect, FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Redirect, RouteComponentProps, useHistory } from 'react-router-dom'
import WizardIsRequired from '~/modules/endUser/core/WizardIsRequired'
import { PrivacyConsent } from './PrivacyConsent'
import { LanguageSelection } from './LanguageSelection'
import { HoganStep } from './HoganStep'
import { ExternalAssessment } from './ExternalAssessment'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import {
  fetchUserAssessment,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { CheckingWizard } from '../CheckingWizard'

const connector = connect((state: RootState) => ({
  userAssessment: state.campaigns.userAssessment,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  started: state.preview.started,
}),
{
  fetchUserAssessment,
})

type Params = {
  userAssessmentId: string
}
type PropsFromRedux = ConnectedProps<typeof connector>
type UserAssessmentProps = PropsFromRedux & RouteComponentProps<Params>

const { I18n } = window

const UserAssessmentComponent: FC<UserAssessmentProps> = ({
  userAssessment: {
    userAssessmentData,
    userAssessmentData: {
      assessmentId,
      id: userAssessmentId,
      selectedLocale,
      availableLocales,
      privacyConsentRequired,
    },
  },
  fetchUserAssessment,
  match: { params },
}) => {
  const history = useHistory()

  useEffect(() => {
    fetchUserAssessment(params.userAssessmentId)
  }, [])

  const [showPolicyAccept, setShowPolicy] = useState(true)
  const [locale, setLocale] = useState(selectedLocale)

  if (!assessmentId) { return <PageContentSkeleton /> }

  const backToCampaign = () => {
    history.push(`/campaigns/${userAssessmentData.campaignId}`)
  }

  const assessmentUrl = ({ url }, lang) => {
    const params = new URLSearchParams(`lang=${lang}`)
    return `${url}?${params.toString()}`
  }

  if (showPolicyAccept && privacyConsentRequired) {
    return <PrivacyConsent onAccept={() => setShowPolicy(false)} />
  }

  if (userAssessmentData.type === 'Assessments::Hogan') {
    return <HoganStep userAssessmentUrl={userAssessmentData.url} />
  }

  if (userAssessmentData.type !== 'Assessments::Common') {
    return (
      <ExternalAssessment
        onCancel={backToCampaign}
        userAssessmentUrl={assessmentUrl(userAssessmentData, locale || I18n.currentLocale())}
      />
    )
  }

  if (WizardIsRequired.run(userAssessmentData.assessmentExtra)) {
    return <CheckingWizard assessmentId={assessmentId} userAssessmentId={userAssessmentId} />
  }

  if (!locale && !availableLocales.includes(I18n.currentLocale())) {
    return (
      <LanguageSelection
        locales={availableLocales}
        select={lang => setLocale(lang)}
        onCancel={backToCampaign}
      />
    )
  }

  return <Redirect to={assessmentUrl(userAssessmentData, locale || I18n.currentLocale())} />
}

export const Assessment = connector(UserAssessmentComponent)
