import { Popover, Button, Space } from 'antd'
import { useSelector } from 'react-redux'
import Foundation from '~/modules/reports/components/Foundation'
import styles from './TableModule.less'
import Types from './Types'
import { joinStyles } from '../../CommonMethods/styles'
import { TableColumnList } from '~/modules/reports/components/modules/Table/components/TableColumnList/TableColumnList'
import { SettingsOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const TableModule = (props) => {
  const {
    module, reportStyles, preview, aiTranslation,
  } = props
  const View = Types[module.props.type] || Types.SimpleTable
  const selectedIds = useSelector(state => state.report.ui.selection.selected)
  const isTableSelected = selectedIds.includes(module.id)
  const onlyOneTableSelected = selectedIds.length === 1

  const style = joinStyles(reportStyles, module.props.styleIds)

  const outerStyle = {}
  outerStyle.borderRadius = style.borderRadius

  if (style.boxShadow?.enabled) {
    const {
      x, y, blur, spread = 0, color = '#000000',
    } = style.boxShadow
    outerStyle.boxShadow = `${x || 0}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`
  }

  return (
    <Foundation {...props} preview={preview} outerStyle={outerStyle} hasTranslation={aiTranslation}>
      {!preview && isTableSelected && onlyOneTableSelected && (
        <Popover
          title="Edit columns"
          trigger={['click']}
          placement="topRight"
          content={<TableColumnList model={module} sourceType="Question" />}
        >
          <Button size="small" className={styles.columnOptions}>
            <Space>
              Column Options
              <SettingsOutlined />
            </Space>
          </Button>
        </Popover>
      )}
      <div className={styles.table}>
        <View {...props} model={module} />
      </div>
    </Foundation>
  )
}

export default TableModule
