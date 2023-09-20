import { Select, Checkbox, Radio } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyFonts from '~/modules/reports/components/PropertyFonts'
import PropertyPagination from '~/modules/reports/components/PropertyPagination'
import ColorPicker from '~/modules/reports/components/ColorPicker'

const Properties = ({ model }) => {
  const [tableStyle, setTableStyle] = useState(model.props.tableStyle || 'classic')
  const changeBackgroundColor = (color) => {
    model.props.style.barColor = color.hex
    model.update()
  }
  const changeProps = (key, value) => {
    model.props[key] = value
    model.update()
  }

  const showOptions = [
    { label: 'Stars', value: 'stars' },
    { label: 'Icons', value: 'icons' },
    { label: 'Bars', value: 'bars' },
    { label: 'Values', value: 'values' },
  ]
  return (
    <div>
      <div>Font</div>
      <PropertyFonts model={model} colors={false} />
      <hr className={styles.divider} />
      <PropertyPagination />
      <hr className={styles.divider} />
      <div className={styles.block}>
        <div className={styles.label}>Sort By</div>
        <Select
          value={model.props.sortBy || 'name'}
          onChange={(value) => {
            model.props.sortBy = value
            model.update()
          }}
          size="small"
        >
          <Select.Option value="name">Name</Select.Option>
          <Select.Option value="value">Value</Select.Option>
        </Select>
        <Radio.Group
          defaultValue={model.props.sortOrder || 'asc'}
          onChange={e => changeProps('sortOrder', e.target.value)}
          size="small"
        >
          <Radio.Button value="asc"><ArrowUpOutlined /></Radio.Button>
          <Radio.Button value="desc"><ArrowDownOutlined /></Radio.Button>
        </Radio.Group>
      </div>
      <div className={styles.block}>
        <div className={styles.label}>Table Style</div>
        <Select
          value={model.props.tableStyle || 'classic'}
          onChange={(value) => {
            model.props.tableStyle = value
            model.update()
            setTableStyle(value)
          }}
          size="small"
        >
          <Select.Option value="classic">Classic</Select.Option>
          <Select.Option value="flexible">Flexible</Select.Option>
        </Select>
      </div>
      {tableStyle === 'flexible' && (
        <>
          <div className={styles.block}>
            <div className={styles.label}>Show elements</div>
            <Checkbox.Group
              options={showOptions}
              defaultValue={model.props.showOptions}
              onChange={value => changeProps('showOptions', value)}
              size="small"
            />
          </div>
          <div className={styles.block}>
            Bars colors
            <ColorPicker
              color={model.props.style.barColor || '#ccc'}
              onChange={changeBackgroundColor}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Properties
