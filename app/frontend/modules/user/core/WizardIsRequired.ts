import Cookies from 'js-cookie'

interface AssessmentExtra {
  enableNetworkCheck: string | null
  enableAudioCheck: string | null
  enableVideoCheck: string | null
}

export default {
  run: ({ enableNetworkCheck, enableAudioCheck, enableVideoCheck }: AssessmentExtra): boolean => {
    if (enableNetworkCheck === '1' && !Cookies.get('checking_wizard.network')) return true
    if (enableAudioCheck === '1' && !Cookies.get('checking_wizard.audio')) return true
    if (enableVideoCheck === '1' && !Cookies.get('checking_wizard.video')) return true

    return false
  },
}
