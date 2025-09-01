import {
  Button, Form, InputNumber, Space, Select, Row, Col, Modal, Typography, Alert,
} from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/reports/core/rootReducers'

import { ColorPicker } from '~/glint'
import {
  DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './GraphValueConditionModal.less'

const { I18n } = window

const initialGraphValueConditions = [
  {
    conditions: [
      { props: { predicate: 'GreaterThan', value: '' } },
    ],
  },
]

const SUPPORTED_GRAPH_TYPES = ['Custom Pie', 'Bar']

export const GraphValueConditionModal = () => {
  const { modules } = useSelector((state:RootState) => ({ ...getData(state.report).graphValueConditionModal }))
  const module = modules[0]
  const { graphValueConditions } = module.props
  const dispatch = useDispatch()
  const predicateOptions = [
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.equal_to'),
      value: 'EqualTo',
    },
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.not_equal_to'),
      value: 'NotEqualTo',
    },
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.greater_than'),
      value: 'GreaterThan',
    },
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.greater_than_or_equal'),
      value: 'GreaterThanOrEqual',
    },
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.less_than'),
      value: 'LessThan',
    },
    {
      label: I18n.t('administration.report_builder.property_panel.predicates.less_than_or_equal'),
      value: 'LessThanOrEqual',
    },
  ]

  const prefixOptions = [
    { label: I18n.t('administration.report_builder.property_panel.prefixes.or'), value: 'Or' },
    { label: I18n.t('administration.report_builder.property_panel.prefixes.and'), value: 'And' },
  ]
  const [form] = Form.useForm()
  const isGraphTypeSupported = SUPPORTED_GRAPH_TYPES.includes(module.moduleConfig.charts[module.props.type])

  useEffect(() => {
    if (!graphValueConditions) {
      form.setFieldValue('graphValueConditions', initialGraphValueConditions)
      module.update()
    }
  }, [])

  const handleSave = () => {
    form.validateFields().then((fieldsData) => {
      modules.forEach((m) => {
        m.props.graphValueConditions = fieldsData.graphValueConditions
        m.update()
      })
      dispatch(closeModal('graphValueConditionModal'))
    })
  }


  return (
    <Modal
      title={I18n.t('administration.report_builder.property_panel.graph_value_conditions_title')}
      width={800}
      destroyOnClose
      closable={!isGraphTypeSupported}
      open
      onCancel={() => dispatch(closeModal('graphValueConditionModal'))}
      okText={I18n.t('administration.common.save')}
      onOk={handleSave}
      footer={footer => (isGraphTypeSupported ? footer : null)}
    >
      {isGraphTypeSupported ? (
        <Form initialValues={{ graphValueConditions }} form={form}>
          <Form.List name="graphValueConditions">
            {(fields, { add, remove }) => (
              <Space direction="vertical" className="w-100" size="middle">
                {fields.map((field, index) => (
                  <div className={styles.conditionContainer}>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        danger
                        className={styles.removeBtn}
                      />
                    )}
                    <Space className="w-100" direction="vertical">
                      <Form.List name={[field.name, 'conditions']}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <>
                                <Row key={field.key} wrap={false} gutter={[14, 0]}>
                                  {index === 0 ? (
                                    <Col span={6}>
                                      <Typography.Text>
                                        {I18n.t('administration.report_builder.property_panel.if_graph_value_is')}
                                      </Typography.Text>
                                    </Col>
                                  ) : (
                                    <Col span={4}>
                                      <Form.Item
                                        name={[field.name, 'props', 'prefix']}
                                        className="mb-4"
                                      >
                                        <Select
                                          getPopupContainer={trigger => trigger.parentNode}
                                          options={prefixOptions}
                                        />
                                      </Form.Item>
                                    </Col>
                                  )}
                                  <Col span={index === 0 ? 8 : 10}>
                                    <Form.Item
                                      name={[field.name, 'props', 'predicate']}
                                      rules={[{
                                        required: true,
                                        message: I18n.t('administration.report_builder.property_panel.missing_value'),
                                      }]}
                                      className="mb-4"
                                    >
                                      <Select
                                        getPopupContainer={trigger => trigger.parentNode}
                                        options={predicateOptions}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col>
                                    <Form.Item
                                      name={[field.name, 'props', 'value']}
                                      rules={[{
                                        required: true,
                                        message: I18n.t('administration.report_builder.property_panel.missing_value'),
                                      }]}
                                      className="mb-4"
                                    >
                                      <InputNumber />
                                    </Form.Item>
                                  </Col>
                                  <Button
                                    type="text"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(field.name)}
                                  />
                                  {index === fields.length - 1 && (
                                    <Button
                                      icon={<PlusCircleOutlined />}
                                      type="text"
                                      onClick={
                                      () => add({ props: { prefix: 'And', predicate: 'GreaterThan', value: '' } })
                                    }
                                    />
                                  )}
                                </Row>
                              </>
                            ))}
                          </>
                        )}
                      </Form.List>
                      <Typography.Text>
                        {I18n.t('administration.report_builder.property_panel.apply_color_label')}
                      </Typography.Text>
                    </Space>
                    <Form.Item name={[field.name, 'color']} className="mb-4">
                      <ColorPicker swatchClassName="mt-1" getValueInHexFormat />
                    </Form.Item>
                    {index === fields.length - 1 && (
                      <div className="w-100 ta-c">
                        <Button
                          onClick={() => add({
                            conditions: [
                              { props: { prefix: 'And', predicate: 'GreaterThan', value: '' } },
                            ],
                          })}
                          icon={<PlusOutlined />}
                          type="dashed"
                        >
                          {I18n.t('administration.report_builder.property_panel.add_new_condition')}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            )}
          </Form.List>
        </Form>
      ) : (
        <Space direction="vertical">
          <Alert
            message={(
              <>
                <p>{I18n.t('administration.report_builder.property_panel.graph_value_condition_not_supported_msg')}</p>
                <ul className="ps-6">
                  {SUPPORTED_GRAPH_TYPES.map((type, index) => <li key={index}>{type}</li>)}
                </ul>
              </>
            )}
            type="warning"
          />
        </Space>
      )
    }
    </Modal>
  )
}
