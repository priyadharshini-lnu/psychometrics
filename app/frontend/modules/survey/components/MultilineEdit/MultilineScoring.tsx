import { FC, useState, useEffect } from 'react'
import {
  Space,
  Popover,
  Button,
  Input,
  Row, Col,
} from 'antd'
import { UnorderedListOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

export interface Props {
  lines: string[]
  cols: number
  rows: number
  onChange: (values:string[]) => void
}

export const MultilineScoring: FC<Props> = ({ lines, onChange, ...props }) => {
  const [multiedit, setMultiedit] = useState(false)

  const handleChange = (values) => {
    onChange(values)
    setMultiedit(false)
  }

  return (
    <Popover
      content={<ChoicesMultiedit lines={lines} onChange={handleChange} {...props} />}
      placement="left"
      trigger="click"
      visible={multiedit}
      onVisibleChange={v => setMultiedit(v)}
    >
      <Button type="primary">
        <UnorderedListOutlined />
        {' '}
        Multiline edit
      </Button>
    </Popover>

  )
}
interface ChoicesMultieditProps {
  lines: string[]
  cols: number
  rows: number
  onChange(values: string[]): void
}

const ChoicesMultiedit: FC<ChoicesMultieditProps> = ({
  lines, onChange, cols, rows,
}) => {
  const [value, setValue] = useState(lines.join('\n'))
  useEffect(() => {
    setValue(lines.join('\n'))
  }, [lines])

  const changeLines = (e) => {
    const lines = e.target.value.split('\n')
    setValue(lines.slice(0, rows).join('\n'))
  }

  const trim = () => {
    setValue(value.split('\n').map(
      v => v.trim().split(/ |\t/).slice(0, cols).join(' '),
    ).filter(v => v).slice(0, rows)
      .join('\n'))
  }

  const onApply = () => {
    onChange(value.split('\n'))
  }

  return (
    <Row gutter={[0, 8]}>
      <Col span={24}>
        <Input.TextArea
          style={{ minWidth: 400, width: '100%' }}
          value={value}
          onChange={changeLines}
          rows={10}
        />
      </Col>
      <Col span={24}>
        <Space>
          <Button type="primary" onClick={onApply}>
            Apply
          </Button>

          <Button onClick={trim}>
            Remove empty lines and spaces and extra values
          </Button>
        </Space>
      </Col>
    </Row>
  )
}
