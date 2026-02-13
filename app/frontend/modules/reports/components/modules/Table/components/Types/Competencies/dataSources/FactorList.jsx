import Select from 'react-select'
import _ from 'lodash'
import { Space, Checkbox } from 'antd'
import AppStore from '~/modules/reports/store/AppStore'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import I18nStore from '~/modules/reports/store/I18nStore'

export default function FactorList ({ model, onChange }) {
  const assessment = AppStore.getAssessmentById(model.assessment_id)
  const options = AppStore.factors[assessment.dimensionId] || []
  const factorIds = model.props.factorIds || []

  const changeAll = () => {
    model.props.allFactors = !model.props.allFactors
    model.update()
  }

  return (
    <div className="mtm">
      <Space orientation="vertical">
        <div>
          <Checkbox checked={model.props.allFactors} onChange={changeAll} />
          {' '}
          All Factors
        </div>
        {!model.props.allFactors && (
          <div>
            Factor
            <Select
              value={getValue(options, factorIds.map(id => ({ id })))}
              options={options}
              getOptionValue={opt => opt.id}
              getOptionLabel={opt => (_.find(options, opt) || {}).name}
              autoFocus={false}
              isClearable={false}
              isMulti
              onChange={factors => onChange('factorIds', (factors || []).map(f => f.id))}
              placeholder={I18nStore.t('reports.modules.common.all_factors')}
            />
          </div>
        )}
      </Space>
    </div>
  )
}
