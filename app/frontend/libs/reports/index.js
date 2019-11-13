import Highcharts from 'highcharts'
import Highcharts3D from 'highcharts-3d'
import HighchartsMore from 'highcharts/highcharts-more'
import SolidGauge from 'highcharts/modules/solid-gauge'
import CustomEvent from './static/customEvents'
import ReportBuilder from './containers/AppContainer'

CustomEvent(Highcharts)
HighchartsMore(Highcharts)
SolidGauge(Highcharts)
Highcharts3D(Highcharts)

export default ReportBuilder
