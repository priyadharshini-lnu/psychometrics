import { connect, ConnectedProps } from 'react-redux'
import { curry } from 'lodash'
import NormFields from 'modules/admin/modules/NormEditor/interfaces/NormFields'
import { savePercentileNorm } from './core/norm'
import { OwnProps } from './interfaces'

const connecter = connect(null, (dispatch, ownProps: OwnProps) => ({
  saveNorm: curry((normId: number, data: NormFields) => dispatch(savePercentileNorm(normId, data)))(ownProps.normId),
}))


export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
