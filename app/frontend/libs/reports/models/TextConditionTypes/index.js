import EmbeddedData from './EmbeddedData'
import Scoring from './Scoring'
import ExternalScoring from './ExternalScoring'
import DataSheet from './DataSheet'

export default {
  EmbeddedData,
  Factor: Scoring,
  Scoring,
  RawScale: ExternalScoring,
  PercentileScale: ExternalScoring,
  PercentileSubscale: ExternalScoring,
  Count: ExternalScoring,
  Score: ExternalScoring,
  Stability: ExternalScoring,
  DataSheet,
}
