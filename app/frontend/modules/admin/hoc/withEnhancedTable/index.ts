import { compose } from 'redux'
import { ComponentType } from 'react'
import connect from './connect'
import withEnhancedTable, { Options } from './withEnhancedTable'

// eslint-disable-line @typescript-eslint/no-explicit-any
export default compose(
  connect,
  withEnhancedTable,
) as <OwnProps>(C: ComponentType<OwnProps>, name: string, options: Options) => ComponentType<OwnProps>
// eslint-enable-line @typescript-eslint/no-explicit-any
