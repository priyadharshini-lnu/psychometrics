import withSkeleton from 'modules/admin/hoc/withSkeleton'
import {
  FETCH_PARTICIPANT_OPTIONS,
} from 'modules/admin/modules/threeSixtyCampaign/core/participantOptions/actions'
import Options from './Options'
import connect from './connect'

export default withSkeleton(connect(Options), FETCH_PARTICIPANT_OPTIONS)
