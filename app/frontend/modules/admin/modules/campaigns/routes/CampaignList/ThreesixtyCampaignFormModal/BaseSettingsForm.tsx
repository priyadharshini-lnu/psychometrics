import { useState } from 'react'
import {
  Button,
  Flex,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Typography,
} from 'antd'
import _ from 'lodash'
import { CampaignCreatorSVG } from './CampaignCreatorSVG'
import { STATUSES } from '~/constants/campaign'
import { Assessment } from '~/modules/admin/modules/campaigns/core/list'
import { THREESIXTY_CATEGORY, TYPES as THREESIXTY_TYPES } from '~/modules/admin/constants/threesixtyCampaign'
import styles from './ThreesixtyCampaignFormModal.less'

const { I18n } = window

type Props = {
  onFinish:(values) => void;
  onClose:() => void;
  initialSettings: {
    name: string;
    status: string;
    threesixty_type: string;
    threesixty_category: string;
  } | null
  assessments: Assessment[]
}

const BaseSettingsForm = ({
  onFinish, onClose, initialSettings, assessments,
}: Props) => {
  const [form] = Form.useForm()
  const category = Form.useWatch('threesixty_category', form)
  const [isCreate, setIsCreate] = useState((initialSettings
    && initialSettings.threesixty_type === THREESIXTY_TYPES.EMPTY) ?? true)
  const [isPrevious360, setIsPrevious360] = useState((initialSettings
    && initialSettings.threesixty_type === THREESIXTY_TYPES.PREVIOUS_360) ?? false)

  const handleFinish = (values) => {
    onFinish(values)
  }

  const handleChange = (values) => {
    const { threesixty_type } = values
    if (threesixty_type && threesixty_type !== THREESIXTY_TYPES.STANDARD_360) {
      setIsCreate(true)
    } else if (threesixty_type && threesixty_type === THREESIXTY_TYPES.STANDARD_360) {
      setIsCreate(false)
    }

    if (threesixty_type && threesixty_type === THREESIXTY_TYPES.PREVIOUS_360) {
      setIsPrevious360(true)
    } else if (threesixty_type && threesixty_type !== THREESIXTY_TYPES.PREVIOUS_360) {
      setIsPrevious360(false)
    }
  }

  return (
    <Form
      layout="vertical"
      initialValues={{
        layout: 'vertical',
        name: initialSettings?.name ? initialSettings.name : '',
        status: initialSettings?.status || STATUSES.ACTIVE,
        threesixty_type: initialSettings?.threesixty_type || THREESIXTY_TYPES.EMPTY,
        threesixty_category: initialSettings?.threesixty_category || THREESIXTY_CATEGORY.NORMAL,
      }}
      form={form}
      className="h-100"
      onFinish={handleFinish}
      onValuesChange={handleChange}
    >
      <Flex vertical className="h-100">
        <Flex flex="auto" className="h-100">
          <Flex gap={8} vertical className="w-100 p-8" style={{ maxWidth: 360 }}>
            <Flex vertical className="w-100">
              <Form.Item
                name="name"
                label={I18n.t('administration.campaigns.modals.create_threesixity.base_settings.name')}
                rules={[{ required: true, transform: value => value.trim() }]}
              >
                <Input name="threesixty_campaign_name" />
              </Form.Item>
            </Flex>

            <Flex vertical className="w-100">
              <Form.Item
                name="status"
                label={I18n.t('administration.campaigns.modals.create_threesixity.base_settings.status')}
                required
              >
                <Radio.Group className="ps-4">
                  <Space>
                    <Radio
                      value={STATUSES.ACTIVE}
                    >
                      {I18n.t(`administration.campaigns.modals.create_threesixity.base_settings.${STATUSES.ACTIVE}`)}
                    </Radio>
                    <Radio
                      value={STATUSES.INACTIVE}
                    >
                      {I18n.t(`administration.campaigns.modals.create_threesixity.base_settings.${STATUSES.INACTIVE}`)}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Flex>

            <Flex vertical className="w-100">
              <Form.Item
                name="threesixty_category"
                label="Category"
                required
              >
                <Radio.Group className="ps-4">
                  <Space>
                    <Radio
                      value={THREESIXTY_CATEGORY.NORMAL}
                    >
                      {I18n.t('administration.campaigns.modals.create_threesixity.base_settings.normal')}
                    </Radio>
                    <Radio
                      value={THREESIXTY_CATEGORY.SKILLS_RATER}
                    >
                      {I18n.t('administration.campaigns.modals.create_threesixity.base_settings.skills_rater')}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Flex>

            <Flex vertical className="w-100">
              <Form.Item
                name="threesixty_type"
                label="Type"
                required
              >
                <Radio.Group className="ps-4">
                  <Space>
                    <Radio
                      value={THREESIXTY_TYPES.EMPTY}
                    >
                      {I18n.t('administration.campaigns.modals.create_threesixity.base_settings.empty')}
                    </Radio>
                    <Radio
                      value={THREESIXTY_TYPES.PREVIOUS_360}
                    >
                      {I18n.t('administration.campaigns.modals.create_threesixity.base_settings.previous')}
                    </Radio>
                    {category !== THREESIXTY_CATEGORY.SKILLS_RATER && (
                      <Radio value={THREESIXTY_TYPES.STANDARD_360}>
                        {I18n.t('administration.campaigns.modals.create_threesixity.base_settings.standard')}
                      </Radio>
                    )}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Flex>
            {isPrevious360 ? (
              <Flex vertical className="w-100">
                <Form.Item
                  name="assessment_id"
                  label={I18n.t('administration.campaigns.modals.create_threesixity.base_settings.assessment')}
                  rules={[{ required: true }]}
                >
                  <Select
                    options={_.map(assessments, (assessment: Assessment) => ({
                      label: assessment.name,
                      value: assessment.id,
                    }))}
                  />
                </Form.Item>
              </Flex>
            ) : null}
          </Flex>
          <Flex
            flex="auto"
            vertical
            className={`${styles.borderLeft} ${styles.background}`}
            justify="center"
            align="center"
          >
            <Flex vertical gap={16} justify="center" align="center">
              <Flex vertical style={{ width: '200px', height: '200px' }} justify="center" align="center">
                <CampaignCreatorSVG />
              </Flex>
              <Flex vertical style={{ maxWidth: '600px' }} justify="center" align="center">
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {I18n.t('administration.campaigns.modals.create_threesixity.instructions_creation.title')}
                </Typography.Title>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {I18n.t(
                    'administration.campaigns.modals.create_threesixity.instructions_creation.sub_title',
                  )}
                </Typography.Title>
                <Typography.Paragraph>
                  <ol>
                    <li>
                      {I18n.t(
                        'administration.campaigns.modals.create_threesixity.instructions_creation.empty',
                      )}
                    </li>
                    <li>
                      {I18n.t(
                        'administration.campaigns.modals.create_threesixity.instructions_creation.standard',
                      )}
                    </li>
                    <li>
                      {I18n.t(
                        'administration.campaigns.modals.create_threesixity.instructions_creation.previous',
                      )}
                    </li>
                  </ol>
                </Typography.Paragraph>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex className={`w-100 p-8 ${styles.borderTop}`} gap={8} justify="flex-end">
          <Button key="back" onClick={onClose}>
            {I18n.t('administration.common.cancel')}
          </Button>
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
          >
            {isCreate ? I18n.t('administration.common.add') : I18n.t('administration.common.next')}
          </Button>
        </Flex>
      </Flex>
    </Form>
  )
}

export default BaseSettingsForm
