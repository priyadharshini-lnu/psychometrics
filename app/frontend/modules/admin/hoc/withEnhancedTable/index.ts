import { compose } from 'redux'
import { ComponentType } from 'react'
import connect from './connect'
import withEnhancedTable, { Options } from './withEnhancedTable'

export default compose(
  connect,
  withEnhancedTable,
) as <OwnProps>(C: ComponentType<OwnProps>, name: string, options: Options) => ComponentType<OwnProps>
