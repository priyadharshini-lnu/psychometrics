import { connect } from 'react-redux'
import { curry } from 'lodash'
import NormFields from 'modules/admin/modules/NormEditor/interfaces/NormFields'
import { savePercentileNorm } from './core/norm'

export default connect(null, (dispatch, ownProps) => ({
  saveNorm: curry((normId: number, data: NormFields) => dispatch(savePercentileNorm(normId, data)))(ownProps.normId),
}))
