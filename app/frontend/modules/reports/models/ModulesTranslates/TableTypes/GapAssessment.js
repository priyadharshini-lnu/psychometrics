import BaseTableTranslate from './BaseTableTranslate'

class Module extends BaseTableTranslate {
  exportLocales () {
    return super.exportTableColumnLocales()
  }
}

export default Module
