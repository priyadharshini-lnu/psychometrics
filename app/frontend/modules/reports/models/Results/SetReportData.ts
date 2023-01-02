import UserReportData from './interfaces/UserReportData'

export default {
  run: (userReportData: UserReportData | null) => {
    if (userReportData) {
      return userReportData.reduce((v, b) => ({ ...v, [b.key]: b.value }), {})
    }

    return {}
  },
}
