import React from 'react'
import { InputNumber, Checkbox } from 'antd'

import { PropertiesModel } from '~/modules/survey/interfaces/questions/TextEntry'

interface Props {
  model: PropertiesModel
}

const PropertyPanel: React.FC<Props> = ({
  model,
  model: {
    props: {
      maxLength,
      usePredefinedRichText,
    },
  },
}) => (
  <div className="mam">
    <label>Max Characters</label>
    <InputNumber
      min={10}
      defaultValue={maxLength}
      onChange={value => model.changeProps({ maxLength: value })}
      style={{ width: '100%' }}
    />
    <Checkbox
      className="mtm"
      checked={usePredefinedRichText}
      onChange={e => model.changeProps({ usePredefinedRichText: e.target.checked })}
    >
      Use predefined text
    </Checkbox>
  </div>
)

export default PropertyPanel
