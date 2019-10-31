import MultipleChoice, { MultipleChoiceProperties, MultipleChoiceScoring } from './MultipleChoice'
import StaticContent, { StaticContentProperties } from './StaticContent'
import TextEntry, { TextEntryProperties, TextEntryScoring } from './TextEntry'
import MatrixTable, { MatrixTableProperties, MatrixTableScoring } from './MatrixTable'
import Slider, { SliderProperties, SliderScoring } from './Slider'
import RankOrder, { RankOrderProperties } from './RankOrder'
import MetaInfo from './MetaInfo'
import SideBySide, { SideBySideProperties, SideBySideScoring } from './SideBySide'
import GapAnalysis, { GapAnalysisProperties } from './GapAnalysis'
import ConstantSum, { ConstantSumProperties } from './ConstantSum'
import PickGroupRank, { PickGroupRankProperties } from './PickGroupRank'
import Timing, { TimingProperties } from './Timing'
import Captcha, { CaptchaProperties } from './Captcha'
import HotSpot, { HotSpotProperties } from './HotSpot'
import GraphicSlider, { GraphicSliderProperties } from './GraphicSlider'
import VideoResponse, { VideoResponseProperties } from './VideoResponse'
import Previews from './Previews'

const Modules = {
  StaticContent,
  MultipleChoice,
  TextEntry,
  MatrixTable,
  Slider,
  RankOrder,
  MetaInfo,
  SideBySide,
  GapAnalysis,
  PickGroupRank,
  Timing,
  Captcha,
  ConstantSum,
  HotSpot,
  GraphicSlider,
  VideoResponse,
}

const Scorings = {
  MultipleChoiceScoring,
  SliderScoring,
  TextEntryScoring,
  SideBySideScoring,
  MatrixTableScoring,
  PickGroupRankScoring: MultipleChoiceScoring,
}

const Properties = {
  StaticContentProperties,
  MultipleChoiceProperties,
  TextEntryProperties,
  MatrixTableProperties,
  SliderProperties,
  RankOrderProperties,
  SideBySideProperties,
  GapAnalysisProperties,
  PickGroupRankProperties,
  TimingProperties,
  CaptchaProperties,
  ConstantSumProperties,
  HotSpotProperties,
  GraphicSliderProperties,
  VideoResponseProperties,
}
export {
  Modules, Previews, Properties, Scorings,
}
