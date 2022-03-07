import React, { useState } from 'react'
import {
  Row, Col, Form, Radio, Button, Upload, RadioChangeEvent,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'

import ColorPicker from 'modules/reports/components/ColorPicker'

const { I18n } = window

export const Design: React.FC = () => {
  const [backgroundType, setBackgroundType] = useState('image')

  const handleBackgroundType = (e: RadioChangeEvent) => {
    setBackgroundType(e.target.value)
  }

  return (
    <Row justify="space-between" className="ps-1">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <Form
          layout="horizontal"
          labelAlign="left"
          labelCol={{
            sm: 24,
            md: 10,
            lg: 8,
            xl: 8,
          }}
        >
          <Form.Item name="clientLogo" label={I18n.t('administration.projects.design_settings.client_logo_label')}>
            <Upload listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>{I18n.t('administration.projects.design_settings.logo_upload')}</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="background" label={I18n.t('administration.projects.design_settings.background_label')}>
            <Radio.Group value={backgroundType} onChange={handleBackgroundType}>
              <Radio value="image">{I18n.t('administration.projects.design_settings.image_label')}</Radio>
              <Radio value="color">{I18n.t('administration.projects.design_settings.color_label')}</Radio>
            </Radio.Group>
            <div className="mt-2">
              {backgroundType === 'image' ? (
                <Upload listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />}>
                    {I18n.t('administration.projects.design_settings.bg_upload')}
                  </Button>
                </Upload>
              ) : (
                <ColorPicker color="red" onChange={() => null} />
              )}
            </div>
          </Form.Item>
          <Form.Item name="boxPosition" label={I18n.t('administration.projects.design_settings.position_label')}>
            <Radio.Group value="right">
              <Radio value="right">{I18n.t('administration.projects.design_settings.position_right')}</Radio>
              <Radio value="center">{I18n.t('administration.projects.design_settings.position_center')}</Radio>
              <Radio value="left">{I18n.t('administration.projects.design_settings.position_left')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="secondaryLogo" label={I18n.t('administration.projects.design_settings.sec_logo_label')}>
            <Upload listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>
                {I18n.t('administration.projects.design_settings.sec_logo_upload')}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}
