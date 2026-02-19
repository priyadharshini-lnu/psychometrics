import {
  Space, Select, Input, Flex,
} from 'antd'
import TextEditor from '~/modules/survey/components/TextEditor'

const CampaignFactorFeedbackComponent = (props) => {
  const { model, campaignFactors } = props
  const changeText = (value) => {
    model.changeProps({ questionText: value })
  }
  const changeLabel = (field, value) => {
    model.changeProps({ [field]: value })
  }

  return (
    <div style={{ position: 'relative' }}>
      <div>
        <TextEditor model={model} value={model.props.questionText} onChange={changeText} />
      </div>
      <Space className="w-100" orientation="vertical">
        <Space size={0} className="w-100" orientation="vertical">
          <TextEditor
            value={model.props.skillLabel || 'Skill {{index}}'}
            onChange={value => changeLabel('skillLabel', value)}
          />
          <Flex align="center" gap={10}>
            <div style={{ width: '400px' }}>
              <TextEditor
                value={model.props.factorLabel || 'Skill factor'}
                onChange={value => changeLabel('factorLabel', value)}
              />
            </div>
            <Flex flex={1}>
              <Select
                className="w-100"
                placeholder="Select a skill factor"
                options={campaignFactors.map(factor => ({ label: factor.name, value: factor.code }))}
              />
            </Flex>
          </Flex>
          <Flex align="center" gap={10}>
            <div style={{ width: '400px' }}>
              <TextEditor
                value={model.props.feedbackLabel || 'Feedback'}
                onChange={value => changeLabel('feedbackLabel', value)}
              />
            </div>
            <Flex flex={1}>
              <Input.TextArea />
            </Flex>
          </Flex>
        </Space>

      </Space>
    </div>
  )
}

export default CampaignFactorFeedbackComponent
