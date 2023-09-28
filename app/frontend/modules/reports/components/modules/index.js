import CellProperties from './CommonProperties/CellProperties'
import PageProperties from './CommonProperties/PageProperties'
import ReportProperties from './CommonProperties/ReportProperties'
import ImageProperties from './Image/components/Properties'

import Text, { TextProperties } from './Text'
import Image from './Image'
import Shape, { ShapeProperties } from './Shape'
import Graph, { GraphProperties } from './Graph'
import Table, { TableProperties } from './Table'

const Modules = {
  Text,
  Image,
  Shape,
  Graph,
  Table,
}

const Properties = {
  CellProperties,
  ReportProperties,
  PageProperties,
  TextProperties,
  ImageProperties,
  ShapeProperties,
  GraphProperties,
  TableProperties,
}
export { Modules, Properties }
