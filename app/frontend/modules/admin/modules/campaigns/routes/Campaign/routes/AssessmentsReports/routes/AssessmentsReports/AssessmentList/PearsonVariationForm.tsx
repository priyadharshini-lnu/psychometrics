import { FC, useState } from 'react'
import {
  Button, Form, Select, message, Descriptions, Flex,
  Checkbox,
} from 'antd'
import { CheckOutlined, LoadingOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

const { Option } = Select

interface Props {
  I18n: I18nInterface;
  assessment: Assessment | undefined;
  campaignId: string;
  updatePearsonVariation: (
    campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
}

export const PearsonVariationForm: FC<Props> = ({
  assessment, campaignId, I18n, updatePearsonVariation,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const currentVariation = assessment?.externalConfig?.variation || '20_items_untimed'
  const [selectedVariation, setSelectedVariation] = useState<string>(currentVariation)

  if (!assessment || assessment.category !== 'pearson') {
    return null
  }

  const { permissions, pearsonVariations } = assessment
  const selectedVariationName = pearsonVariations?.find(variation => variation.code === selectedVariation)?.name || ''

  if (!pearsonVariations) {
    return null
  }

  const handleSubmit = (values) => {
    setLoading(true)
    const payload = {
      externalConfig: JSON.stringify({ ...assessment?.externalConfig, variation: values.variation }),
      apply: values.apply || false,
    }

    updatePearsonVariation(campaignId, assessment.id, payload).then(() => {
      message.success(I18n.t('campaign_assessment.pearson_variation_form.update_success'))
    }).catch((err) => {
      message.error(err)
    }).finally(() => {
      resetForm()
    })
  }

  const resetForm = () => {
    setLoading(false)
    setIsFormVisible(false)
  }

  const handleClose = () => {
    resetForm()
    setSelectedVariation(currentVariation)
  }

  return (
    <Descriptions
      layout="horizontal"
      rootClassName="mb-6 w-100"
      bordered
      column={1}
    >
      <Descriptions.Item
        className="va-t w-30"
        labelStyle={{ width: '40%' }}
        contentStyle={{ width: '60%' }}
        label={I18n.t('campaign_assessment.column.pearson_variation')}
      >
        {isFormVisible ? (
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ variation: selectedVariation }}>
            <Form.Item label={I18n.t('campaign_assessment.pearson_variation_form.select')} name="variation">
              <Select
                placeholder={I18n.t('campaign_assessment.pearson_variation_form.select')}
                onChange={value => setSelectedVariation(value)}
                style={{ width: '100%' }}
              >
                {pearsonVariations?.map(variation => (
                  <Option key={variation.code} value={variation.code}>
                    {variation.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="apply" valuePropName="checked" className="mbl">
              <Checkbox>
                {I18n.t('campaign_assessment.pearson_variation_form.apply_to_existing_users')}
              </Checkbox>
            </Form.Item>
            <Flex gap={16} justify="flex-end">
              <Button key="back" onClick={handleClose}>{I18n.t('common.actions.cancel')}</Button>
              <Button type="primary" key="submit" htmlType="submit">
                {loading ? <LoadingOutlined /> : <CheckOutlined />}
                {I18n.t('campaign_assessment.pearson_variation_form.update')}
              </Button>
            </Flex>
          </Form>
        ) : (
          <div>
            {selectedVariationName}
            {permissions.updatePearsonVariation && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setIsFormVisible(true)}
              />
            )}
          </div>
        )}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default PearsonVariationForm
