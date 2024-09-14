import { connect } from 'react-redux'
import _ from 'lodash'
import { Select, Space, Typography } from 'antd'
import { RootState } from '~/modules/reports/core/rootReducers'
import { changeSize } from '~/modules/reports/core/builder/actions'
import { PAGE_SIZES, ALL_PAGE_SIZES } from '~/modules/reports/models/Report'


const PageSettingsComponent = ({ report, changeSize }) => {
  const currentSize = () => ALL_PAGE_SIZES.find(
    ({ width, height }) => width === report.props.sizes.width && height === report.props.sizes.height,
  )

  const getPageSizeLabel = () => currentSize()?.label

  const changePageSize = (value) => {
    const size = PAGE_SIZES.find(size => size.label === value)
    if (!size) { return }

    changeSize({ width: size.width, height: size.height, fontSize: report.props.sizes.fontSize })
  }

  return (
    <div>
      <Space style={{ width: '100%' }}>
        <Typography.Title level={5}>Page Size:</Typography.Title>
        <Select value={getPageSizeLabel()} onChange={changePageSize} style={{ width: 280 }}>
          {_.uniqBy([...PAGE_SIZES, currentSize()], 'width').map(size => (
            size && <Select.Option key={size.label} value={size.label}>{size.label}</Select.Option>
          ))}
        </Select>
      </Space>
    </div>
  )
}

export const PageSettings = connect(
  ({ report: { builder } }: RootState) => ({
    report: builder,
  }),
  {
    changeSize,
  },
)(PageSettingsComponent)
