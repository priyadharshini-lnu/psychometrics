import Question from './Question'
import DeviceType from './DeviceType'
import GeoIP from './GeoIP'
import EmbeddedData from './EmbeddedData'
import DataSheet from './DataSheet'
import EvaluatorRelationship from './EvaluatorRelationship'
import UserType from '~/modules/survey/components/LogicElement/types/UserType'

export default {
  Question,
  DeviceType,
  EmbeddedData,
  GeoIP,
  DataSheet,
  SubjectDataSheet: DataSheet,
  EvaluatorRelationship,
  UserType: { Editor: UserType.Select, Preview: UserType.Preview },
}
