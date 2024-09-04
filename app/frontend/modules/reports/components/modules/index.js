import CellProperties from './CommonProperties/CellProperties'
import PageProperties from './CommonProperties/PageProperties'
import ImageProperties from './Image/components/Properties'

import Text, { TextProperties } from './Text'
import Image from './Image'
import Shape, { ShapeProperties } from './Shape'
import Graph, { GraphProperties } from './Graph'
import Table, { TableProperties } from './Table'
import Error from './Error'

const Modules = {
  Text,
  Image,
  Shape,
  Graph,
  Table,
  Error,
}

const Properties = {
  CellProperties,
  PageProperties,
  TextProperties,
  ImageProperties,
  ShapeProperties,
  GraphProperties,
  TableProperties,
}
export { Modules, Properties }
