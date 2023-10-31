import { FC, useState } from 'react'
import {
  Space,
  Popover,
  Button,
  Input,
  Row, Col,
} from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons'

export interface Props {
  title: string
  lines: string[]
  onChange: (values:string[]) => void
}

export const MultilineEdit: FC<Props> = ({ title, lines, onChange }) => {
  const [multiedit, setMultiedit] = useState(false)

  const handleChange = (values) => {
    onChange(values)
    setMultiedit(false)
  }

  return (
    <Popover
      content={<ChoicesMultiedit lines={lines} onChange={handleChange} />}
      title={title}
      placement="left"
      trigger="click"
      open={multiedit}
      onOpenChange={v => setMultiedit(v)}
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
  onChange(values: string[]): void
}

const ChoicesMultiedit: FC<ChoicesMultieditProps> = ({ lines, onChange }) => {
  const [value, setValue] = useState(lines.join('\n'))

  const changeLines = (e) => {
    setValue(e.target.value)
  }

  const trim = () => {
    setValue(value.split('\n').map(v => v.trim()).filter(v => v).join('\n'))
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
            Remove empty lines and spaces
          </Button>
        </Space>
      </Col>
    </Row>
  )
}
