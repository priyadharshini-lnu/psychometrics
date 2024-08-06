import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'

const PipedText = {
  run (text, module, params = {}): string | null {
    const { assessment_id: assessmentId } = module

    const interpolate = /{{(first_name|last_name|completed_at|norm_used|locale_name|page_number|total_pages)}}/g
    const compiled = _.template(text, { interpolate })

    return compiled({
      first_name: _.get(ResultStore, 'user.first_name', '{{first_name}}'),
      last_name: _.get(ResultStore, 'user.last_name', '{{last_name}}'),
      completed_at: _.get(AppStore, 'report.result_completed_at', '{{completed_at}}'),
      norm_used: _.get(AppStore, ['report', 'norm_used', assessmentId], '{{norm_used}}'),
      locale_name: _.get(AppStore, ['report', 'result_locale', assessmentId], '{{locale_name}}'),
      ...params,
    })
  },
}


export default PipedText
