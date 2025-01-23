import { Select, Checkbox, Radio } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import PropertyPagination from '~/modules/reports/components/PropertyPagination'
import { ColorPicker } from '~/glint'

const Properties = ({ modules }) => {
  const model = modules[0]
  const [tableStyle, setTableStyle] = useState(model.props.tableStyle || 'classic')

  const changeBackgroundColor = (color) => {
    modules.forEach((model) => {
      model.props.style.barColor = color
      model.update()
    })
  }

  const changeProps = (key, value) => {
    modules.forEach((model) => {
      model.props[key] = value
      model.update()
    })
  }

  const changeTableStyle = (value) => {
    modules.forEach((model) => {
      model.props.tableStyle = value
      model.update()
    })
    setTableStyle(value)
  }

  const showOptions = [
    { label: 'Stars', value: 'stars' },
    { label: 'Icons', value: 'icons' },
    { label: 'Bars', value: 'bars' },
    { label: 'Values', value: 'values' },
  ]
  return (
    <div>
      <hr className={styles.divider} />
      <PropertyPagination modules={modules} />
      <hr className={styles.divider} />
      <div className={styles.block}>
        <div className={styles.label}>Sort By</div>
        <Select
          value={model.props.sortBy || 'name'}
          onChange={value => changeProps('sortBy', value)}
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
          onChange={changeTableStyle}
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
              getValueInHexFormat
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
