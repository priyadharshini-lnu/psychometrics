import { FC } from 'react'
import { Select, Typography } from 'antd'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  onChange(key: string, value: string): void
}

const SourceTypeButtonGroup: FC<Props> = ({ model, onChange }) => {
  const {
    props: { sourceType },
  } = model

  const handleOnChange = (value: string) => {
    onChange('sourceType', value)
  }

  return (
    <div>
      <Typography.Text>Data source</Typography.Text>
      <Select
        className="w-100"
        onChange={handleOnChange}
        value={sourceType}
        size="small"
      >
        <Select.Option value="Factor">Factors</Select.Option>
        <Select.Option value="Question">Questions</Select.Option>
      </Select>
    </div>
  )
}

export default SourceTypeButtonGroup
