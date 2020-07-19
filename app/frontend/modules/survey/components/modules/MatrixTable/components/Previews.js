import Likert from './types/Likert/Preview'
import Bipolar from './types/Bipolar/Preview'
import TextEntry from './types/TextEntry/Preview'
import ConstantSum from './types/ConstantSum/Preview'
import MaxDiff from './types/MaxDiff/Preview'
import RankOrder from './types/RankOrder/Preview'
import Profile from './types/Profile/Preview'
import connect from '../connect'

export default {
  Likert: connect(Likert),
  Bipolar: connect(Bipolar),
  Profile: connect(Profile),
  TextEntry: connect(TextEntry),
  ConstantSum: connect(ConstantSum),
  MaxDiff: connect(MaxDiff),
  RankOrder: connect(RankOrder),
}
