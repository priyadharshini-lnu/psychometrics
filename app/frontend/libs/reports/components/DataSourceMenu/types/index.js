import EmbeddedData from './EmbeddedData'
import Factor from './Factor'
import DataSheet from './DataSheet'
import Question from './Question'
import BaseExternalFactor from './BaseExternalFactor'

export default {
  EmbeddedData,
  Factor,
  Question,
  DataSheet,
  Count: BaseExternalFactor,
  Score: BaseExternalFactor,
  Stability: BaseExternalFactor,
  RawScale: BaseExternalFactor,
  PercentileScale: BaseExternalFactor,
  PercentileSubscale: BaseExternalFactor,
}
