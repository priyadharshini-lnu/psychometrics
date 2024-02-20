import EmbeddedData from './EmbeddedData'
import Scoring from './Scoring'
import ExternalScoring from './ExternalScoring'
import { SavilleScoring } from './SavilleScoring'
import DataSheet from './DataSheet'
import CampaignFactors from './CampaignFactors'
import ReportData from './ReportData'

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
  CampaignFactors,
  ReportData,
  'Saville#Ipsative': SavilleScoring,
  'Saville#Nipsative': SavilleScoring,
  'Saville#Normative': SavilleScoring,
  'Saville#Raw': SavilleScoring,
}
