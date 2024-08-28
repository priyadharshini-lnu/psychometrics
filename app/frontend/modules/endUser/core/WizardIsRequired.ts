import Cookies from 'js-cookie'
import { AssessmentExtra } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

export default {
  run: (
    { enableNetworkCheck, enableAudioCheck, enableVideoCheck }: AssessmentExtra,
    userAssessmentId: number,
  ): boolean => {
    if (enableNetworkCheck && !Cookies.get('checking_wizard.network')) return true
    if (enableAudioCheck && !Cookies.get('checking_wizard.audio')) return true
    const checkWizardCookie = JSON.parse(Cookies.get('checking_wizard.video') || '{}')
    if (enableVideoCheck && !checkWizardCookie[userAssessmentId]) return true

    return false
  },
}
