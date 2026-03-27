import _ from 'lodash'

class BaseTranslateTranslate {
  constructor (module) {
    this.module = module
  }

  getValueByCode () {
    console.error('should be implemented')
  }

  exportLocales () {
    console.error('should be implemented')
  }

  exportTableColumnLocales () {
    const { sourceType } = this.module.props
    const tableColumnsDataPath = sourceType ? `tableColumns.${sourceType}` : 'tableColumns'
    const result = {}
    if (this.module.props.tableColumns) {
      _.each(_.get(this.module.props, tableColumnsDataPath), (tableColumn, key) => {
        const exportKeyPath = sourceType ? `tableColumns-${sourceType}-${key}-label` : `tableColumns-${key}-label`
        result[exportKeyPath] = tableColumn.label
      })
    }

    return result
  }
}

export default BaseTranslateTranslate
