import { Modal, Button,InputNumber,Space } from 'antd'; 
const { I18n } = window
import { useState } from 'react'
import Question from '~/modules/survey/models/Question'

const defaultBackground = {
  baseOffset: 1,
}

interface State {
  baseOffset: number
}


const AutomaticPageBreakModal = ({ model, updateBlockProps, close,automaticPageBreak }) => {
  console.log("inside the model",model,automaticPageBreak)
  const [state, setState] = useState<State>({ ...defaultBackground })
console.log("model",model)
  const save = () => {
    automaticPageBreak(model,new Question({ name: 'PB', type: 'PageBreak' }),state.baseOffset);
    close()
  }
  return (
    <Modal
    width="50%"
    title={"Automatic Page Break"}
    open
    maskClosable={false}
    onCancel={close}
    footer={[
      <Button key="back" onClick={close}>
        {I18n.t('common.actions.cancel')}
      </Button>,
      <Button key="submit" type="primary" onClick={save}>
        {I18n.t('common.actions.save')}
      </Button>,
      ]}
    >
  <div>
  <Space>
             
                <p>select page break number</p>    {/* convert to i18 */}

                <InputNumber
                  value={state.baseOffset}
                  min={1}
                  max={100}
                  onChange={val => setState({ ...state, baseOffset: val ? +val : 1 })}
                />
              </Space>

      </div>

    </Modal>
  )
}

export default AutomaticPageBreakModal
