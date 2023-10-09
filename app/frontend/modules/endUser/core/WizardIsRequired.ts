import Cookies from 'js-cookie'
import { AssessmentExtra } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

export default {
  run: ({ enableNetworkCheck, enableAudioCheck, enableVideoCheck }: AssessmentExtra): boolean => {
    if (enableNetworkCheck && !Cookies.get('checking_wizard.network')) return true
    if (enableAudioCheck && !Cookies.get('checking_wizard.audio')) return true
    if (enableVideoCheck && !Cookies.get('checking_wizard.video')) return true

    return false
  },
}
