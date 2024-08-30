import Question from './Question'
import DeviceType from './DeviceType'
import GeoIP from './GeoIP'
import EmbeddedData from './EmbeddedData'
import EvaluatorRelationship from './EvaluatorRelationship'
import DataSheet from './DataSheet'
import UserType from './UserType'

export default {
  Question: Question.Select,
  DeviceType: DeviceType.Select,
  EmbeddedData: EmbeddedData.Select,
  GeoIP: GeoIP.Select,
  EvaluatorRelationship: EvaluatorRelationship.Select,
  SubjectDataSheet: DataSheet.Select,
  EvaluatorDataSheet: DataSheet.Select,
  UserType: UserType.Select,
}

export const Previews = {
  Question: Question.Preview,
  DeviceType: DeviceType.Preview,
  EmbeddedData: EmbeddedData.Preview,
  GeoIP: GeoIP.Preview,
  EvaluatorRelationship: EvaluatorRelationship.Preview,
  SubjectDataSheet: DataSheet.Preview,
  EvaluatorDataSheet: DataSheet.Preview,
  UserType: UserType.Preview,
}
