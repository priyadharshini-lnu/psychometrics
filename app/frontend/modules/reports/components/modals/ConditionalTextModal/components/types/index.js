import Scoring from './Scoring'
import EmbeddedData from './EmbeddedData'
import ReportData from './ReportData'
import { SavilleScoring } from './Scoring/SavilleScoring'

export default {
  Factor: Scoring,
  RawScale: Scoring,
  PercentileScale: Scoring,
  PercentileSubscale: Scoring,
  Count: Scoring,
  Score: Scoring,
  Stability: Scoring,
  EmbeddedData,
  DataSheet: Scoring,
  CampaignFactors: Scoring,
  ReportData,
  'Saville#Ipsative': SavilleScoring,
  'Saville#Nipsative': SavilleScoring,
  'Saville#Normative': SavilleScoring,
  'Saville#Raw': SavilleScoring,
}
