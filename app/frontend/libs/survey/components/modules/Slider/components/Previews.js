import SliderPreview from './types/Slider/Preview'
import BarPreview from './types/Bar/Preview'
import StarPreview from './types/Star/Preview'
import connect from '../connect'

export default {
  Slider: connect(SliderPreview),
  Bar: connect(BarPreview),
  Star: connect(StarPreview),
}
