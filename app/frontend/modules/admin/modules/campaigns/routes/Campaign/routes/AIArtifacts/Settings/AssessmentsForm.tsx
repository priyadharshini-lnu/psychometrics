import React, { useState } from 'react'
import {
  Button, Select, Form, Row, Col,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window
export const AssessmentsForm: React.FC = () => {
  // TODO: Replace 'any' with a more specific type for data once assessment changes merged
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>[]>([])
  const handleAdd = (item) => {
    setData(prevData => [...prevData, item])
  }

  return (
    <>
      <Button onClick={handleAdd} type="primary" className="mb-4" icon={<PlusOutlined />}>
        {I18n.t('common.actions.add')}
      </Button>
      {data && data.map((item, index) => (
        <Row gutter={8}>
          <Col span={10}>
            <Select
              placeholder={I18n.t('administration.ai_artifacts.form.select_assessment')}
              allowClear
              showSearch
              style={{ flex: 1 }}
            />
          </Col>
          <Col span={10}>
            <Form.Item name={item.id} key={item.id} style={{ flex: 1 }}>
              <Select
                mode="multiple"
                placeholder={I18n.t('administration.ai_artifacts.form.select_questions')}
                allowClear
                showSearch
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button
              type="link"
              onClick={() => {
                setData(prevData => prevData.filter(item => item.id !== index))
              }}
              icon={<DeleteOutlined />}
            />
          </Col>
        </Row>
      ))}
    </>
  )
}
