import { FC, useState } from 'react'
import {
  Drawer, Form, Input, Button, Select,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import { DirectionalNavigateBackIcon, LuaEditor } from '~/glint'
// import { useResources } from '~/hooks/useResources'

type Props = {
  open: boolean
  onClose: () => void
  addFactor?: (values) => void
  editFactor?: (values) => void
  factorData?: Store
}

const { I18n } = window

const factorTypes = [
  { label: 'Assessment', value: 'assessment' },
  { label: 'Assessor Scoring', value: 'assessor_scoring' },
  { label: 'Formula', value: 'formula' },
]

export const AddEditFactorForm: FC<Props> = ({
  open, onClose, addFactor, factorData, editFactor,
}) => {
  const [, setFields] = useState<Store>([])
  const [form] = Form.useForm()
  const factorType = form.getFieldValue('factorType')
  const initialValues = factorData || { publicVisibility: true }

  // const { data: dimensions, fetch: fetchDimensions } = useResources('dimensions')
  // const { data: assessorFormFactors, fetch: fetchFactors } = useResources('factors')
  // const { data: assessments, fetch: fetchAssessments } = useResources('assessments')
  // const { data: assessmentFactors, fetch: fetchFactors } = useResources('factors')

  let formFieldBasedOnFactorType = factorType === 'assessment' ? (
    <>
      <Form.Item name="assessment" label={I18n.t('administration.scoring.assessment')}>
        <Select
          showSearch
        >
          {/* {dimensions.map((dimension) => {
            <Select.Option key={dimension.id} value={dimension.id}>{dimension.name}</Select.Option>
          })} */}
        </Select>
      </Form.Item>
      <Form.Item name="factor" label={I18n.t('administration.scoring.factor')}>
        <Select
          showSearch
        >
          {/* {assessorFormFactors.map((factor) => {
            <Select.Option key={factor.id} value={factor.id}>{`${factor.id}: ${factor.name}`}</Select.Option>
          })} */}
        </Select>
      </Form.Item>
    </>
  ) : null

  if (factorType === 'assessor_scoring') {
    formFieldBasedOnFactorType = (
      <>
        <Form.Item name="dimension" label={I18n.t('administration.scoring.dimension')}>
          <Select
            showSearch
          >
            {/* {assessments.map((assessment) => {
              <Select.Option key={assessment.id} value={assessment.id}>{assessment.name}</Select.Option>
            })} */}
          </Select>
        </Form.Item>
        <Form.Item name="factor" label={I18n.t('administration.scoring.factor')}>
          <Select
            showSearch
          >
            {/* {assessmentFactors.map((factor) => {
              <Select.Option key={factor.id} value={factor.id}>{`${factor.id}: ${factor.name}`}</Select.Option>
            })} */}
          </Select>
        </Form.Item>
      </>
    )
  }

  if (factorType === 'formula') {
    formFieldBasedOnFactorType = (
      <>
        <Form.Item name="formula" label={I18n.t('administration.scoring.formula')}>
          <LuaEditor controlled />
        </Form.Item>
      </>
    )
  }

  const handleFormFinish = (values) => {
    addFactor && addFactor(values)
    editFactor && editFactor(values)
    onClose()
  }

  return (
    <Drawer
      destroyOnClose
      closeIcon={<DirectionalNavigateBackIcon />}
      title={I18n.t('administration.scoring.add_factor')}
      open={open}
      onClose={onClose}
      width="70%"
    >
      <Form
        onFieldsChange={setFields}
        form={form}
        colon={false}
        layout="vertical"
        onFinish={handleFormFinish}
        initialValues={initialValues}
      >
        <Form.Item name="code" label={I18n.t('administration.scoring.code')}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label={I18n.t('administration.scoring.name')}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={I18n.t('administration.scoring.description')}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="outputType" label={I18n.t('administration.scoring.output_type')}>
          <Select defaultValue="numeric">
            {['numeric', 'string'].map(
              value => <Select.Option key={value} value={value}>{value}</Select.Option>,
            )}
          </Select>
        </Form.Item>
        <Form.Item name="factorType" label={I18n.t('administration.scoring.type')}>
          <Select>
            {factorTypes.map(type => <Select.Option key={type.value} value={type.value}>{type.label}</Select.Option>)}
          </Select>
        </Form.Item>
        {formFieldBasedOnFactorType}
        <Form.Item
          valuePropName="checked"
          name="publicVisibility"
          wrapperCol={{ span: 1 }}
          label={I18n.t('administration.scoring.public')}
        >
          <Input type="checkbox" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">{I18n.t('administration.scoring.save')}</Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}
