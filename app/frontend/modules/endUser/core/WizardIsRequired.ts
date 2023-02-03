import Cookies from 'js-cookie'
import { AssessmentExtra } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

export default {
  run: ({ enableNetworkCheck, enableAudioCheck, enableVideoCheck }: AssessmentExtra): boolean => {
    if (enableNetworkCheck === '1' && !Cookies.get('checking_wizard.network')) return true
    if (enableAudioCheck === '1' && !Cookies.get('checking_wizard.audio')) return true
    if (enableVideoCheck === '1' && !Cookies.get('checking_wizard.video')) return true

    return false
  },
}
