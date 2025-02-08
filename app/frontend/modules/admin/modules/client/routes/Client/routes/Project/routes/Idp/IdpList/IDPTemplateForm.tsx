import {
  Form, Input, Switch, Card, Col, Row, Button, Modal,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useResourceContext } from '~/modules/admin/components/Resource'
import SkillsAndTagsSelection from './SkillsAndTagsSelection'
import { Idp } from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

const IDPTemplateForm = ({ close }) => {
  const { resource } = useResourceContext<Idp>()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { projectId } = useParams() as {projectId: string}

  const addIdpHandler = async () => {
    try {
      setIsLoading(true)
      const values = await form.validateFields()
      const skills = Object.keys(values)
        .filter(key => key.endsWith('_skills'))
        .reduce((acc: string[], key: string) => {
          if (Array.isArray(values[key])) {
            acc.push(...values[key])
          }
          return acc
        }, []).map(skill => ({ id: skill, type: 'skills' }))
      const payload = {
        name: values.name,
        self_rating_enabled: values.self_rating_enabled,
        description: values.description,
        skills,
        behavioural_global_tags: values.behavioural_global_tags || [],
        behavioural_client_tags: values.behavioural_client_tags || [],
        technical_global_tags: values.technical_global_tags || [],
        technical_client_tags: values.technical_client_tags || [],
      }
      await resource.createResource(payload)
      setIsModalVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={I18n.t('administration.idp.idp_template')}
      open={isModalVisible}
      onCancel={close}
      onOk={addIdpHandler}
      width="80%"
      style={{ maxWidth: '1024px' }}
      okText={I18n.t('common.actions.add')}
      cancelText={I18n.t('common.actions.cancel')}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={addIdpHandler}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.add')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ self_rating_enabled: true }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title={I18n.t('administration.idp.template_details')}>
              <Form.Item
                name="name"
                label={I18n.t('administration.idp.enter_template_name')}
                rules={[{ required: true, message: I18n.t('administration.idp.enter_template_name_error') }]}
              >
                <Input placeholder={I18n.t('administration.idp.enter_template_name')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={I18n.t('administration.idp.enter_template_description')}
                rules={[{ required: true, message: I18n.t('administration.idp.enter_template_description_error') }]}
              >
                <Input placeholder={I18n.t('administration.idp.enter_template_description')} />
              </Form.Item>

              <Form.Item name="self_rating_enabled" label={I18n.t('administration.idp.self_rating')}>
                <Switch checkedChildren={I18n.t('yes')} unCheckedChildren={I18n.t('no')} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title={I18n.t('administration.idp.behavioral_skills')}>
              <SkillsAndTagsSelection category="behavioral" type="Global" form={form} />
              <SkillsAndTagsSelection category="behavioral" type="Client" projectId={projectId} form={form} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title={I18n.t('administration.idp.technical_skills')}>
              <SkillsAndTagsSelection category="technical" type="Global" form={form} />
              <SkillsAndTagsSelection category="technical" type="Client" projectId={projectId} form={form} />
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default IDPTemplateForm
