import { useState } from 'react'
import {
  Popover, Button, Dropdown, Form,
  Checkbox, Typography, Radio, Input,
} from 'antd'
import Block from '~/modules/survey/models/Block'
import Menu from '~/modules/survey/components/ModulesMenu'

import styles from './Block.less'


const { I18n } = window

const BlockFooter = ({
  model, onMinimize, createBlock, addQuestion, openCreateByTemplate, updateBlockProps,
}) => {
  const [openMenu, setOpenMenu] = useState(false)
  const isSkillRaterBlock = model.blockType === 'skills_rater'

  const addBlock = (type) => {
    createBlock(new Block({ position: model.position, blockType: type }))
  }

  const createDefault = () => {
    addQuestion(model)
  }

  const changeType = (type) => {
    addQuestion(model, { type })
    setOpenMenu(false)
  }

  const openSearchQuestionPopup = () => {
    openCreateByTemplate({ blockId: model.id, entityName: 'Question' })
  }

  const openSearchBlockPopup = () => {
    openCreateByTemplate({ position: model.position, entityName: 'Block' })
  }

  const copyQuestion = !model.templateId ? (
    <Button
      onClick={openSearchQuestionPopup}
      icon={<span className={`icon fa fa-copy ${styles.icon}`} />}
      className={`${styles.button}`}
    >
      Copy Question From...
    </Button>
  )
    : (
      <a className={`btn btn-default ${styles.button}`} style={{ opacity: 0 }} />
    )

  const blockContent = isSkillRaterBlock ? (
    <div className="ms-14 me-14 mt-10 mb-10">
      <SkillRater updateBlockProps={updateBlockProps} model={model} />
    </div>
  ) : (
    <div className={styles.footerButtons}>
      {copyQuestion}
      <div className={styles.createQuestion}>
        <Button
          type="primary"
          menu={[]}
          icon={<span className={`icon fa fa-plus ${styles.icon}`} />}
          onClick={createDefault}
          className={styles.left}
        >
          Create a New Question...
        </Button>
        <Popover
          trigger="click"
          overlayInnerStyle={{ padding: 0 }}
          onClick={() => setOpenMenu(true)}
          content={<Menu onSelect={changeType} />}
          open={openMenu}
          onOpenChange={open => setOpenMenu(open)}
        >
          <Button className={styles.right} type="primary" icon={<span className="caret" />} />
        </Popover>
      </div>
    </div>
  )

  return (
    <div className={styles.footer}>
      {blockContent}
      <div className={styles.footerOptions}>
        <div className={styles.footerMinimize} onClick={onMinimize}>Minimize Block</div>
        <div className={`${styles.footerMinimize} ${styles.footerAddBlock}`}>
          <AddBlockMenu onAddBlock={addBlock} />
        </div>
        <div onClick={openSearchBlockPopup} className={`${styles.footerMinimize} ${styles.footerAddBlock}`}>
          Copy Block From...
        </div>
      </div>
    </div>
  )
}

const AddBlockMenu = ({ onAddBlock }) => {
  const menuItems = [
    {
      label: I18n.t('administration.survey_builder.models.block_types.regular'),
      key: 'regular',
    },
    {
      label: I18n.t('administration.survey_builder.models.block_types.skill_rater'),
      key: 'skills_rater',
    },
  ]
  return (
    <Dropdown
      trigger={['click']}
      menu={{ items: menuItems, onClick: ({ key }) => onAddBlock(key) }}
    >
      Add Block
    </Dropdown>
  )
}

const SkillRater = ({ model, updateBlockProps }) => {
  const initialJobRolesData = model.props?.skills_config
  const initialRequiredValidation = model.props?.required_validation
  const initialNotApplicable = model.props?.not_applicable
  const [form] = Form.useForm()
  const technicalEnabled = Form.useWatch(['technical', 'enabled'], form)
  const behavioralEnabled = Form.useWatch(['behavioral', 'enabled'], form)
  const otherEnabled = Form.useWatch(['other', 'enabled'], form)
  const requireValidationEnabled = Form.useWatch(['required_validation', 'enabled'], form)
  const notApplicableEnabled = Form.useWatch(['not_applicable', 'enabled'], form)

  const handleFieldsChange = () => {
    const allFormFields = form.getFieldsValue()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { required_validation, not_applicable, ...skillsConfig } = allFormFields

    const notApplicableData = {
      ...not_applicable,
      label: not_applicable.label
        || I18n.t('administration.survey_builder.builder_area.default_not_applicable_label'),
    }

    updateBlockProps(model, {
      skills_config: skillsConfig,
      required_validation,
      not_applicable: notApplicableData,
    })
  }

  const initialValues = {
    ...initialJobRolesData,
    required_validation: initialRequiredValidation || { enabled: false, type: 'Force' },
    not_applicable: {
      enabled: initialNotApplicable?.enabled || false,
      label: initialNotApplicable?.label
        || I18n.t('administration.survey_builder.builder_area.default_not_applicable_label'),
    },
  }

  return (
    <Form
      form={form}
      onFieldsChange={handleFieldsChange}
      initialValues={initialValues}
      className={styles.skillRaterForm}
      layout="vertical"
    >
      <Typography.Title
        className="fs-20"
        level={5}
      >
        {I18n.t('administration.survey_builder.builder_area.skill_rater_config')}
      </Typography.Title>
      <Form.Item
        className="mb-0"
        name={['technical', 'enabled']}
        valuePropName="checked"
      >
        <Checkbox>
          {I18n.t('administration.survey_builder.models.skill_types.technical')}
        </Checkbox>
      </Form.Item>
      {technicalEnabled && <JobRoleFormItem name="technical" />}
      <Form.Item
        className="mb-0"
        name={['behavioral', 'enabled']}
        valuePropName="checked"
      >
        <Checkbox>
          {I18n.t('administration.survey_builder.models.skill_types.behavioural')}
        </Checkbox>
      </Form.Item>
      {behavioralEnabled && <JobRoleFormItem name="behavioral" />}
      <Form.Item
        className="mb-0"
        name={['other', 'enabled']}
        valuePropName="checked"
      >
        <Checkbox>
          {I18n.t('administration.survey_builder.models.skill_types.other')}
        </Checkbox>
      </Form.Item>
      {otherEnabled && <JobRoleFormItem name="other" />}

      <div>
        <hr style={{ borderColor: '#d9d9d9' }} />
      </div>

      <RequiredValidationFormItem requireValidationEnabled={requireValidationEnabled} />

      <div>
        <hr style={{ borderColor: '#d9d9d9' }} />
      </div>

      <NotApplicableFormItem notApplicableEnabled={notApplicableEnabled} />
    </Form>
  )
}

const RequiredValidationFormItem = ({ requireValidationEnabled }) => (
  <>
    <Form.Item
      className="mb-0"
      name={['required_validation', 'enabled']}
      valuePropName="checked"
    >
      <Checkbox>
        {I18n.t('administration.survey_builder.builder_area.enable_required_validation')}
      </Checkbox>
    </Form.Item>
    {requireValidationEnabled && (
      <Form.Item
        className="mb-6 ms-8"
        name={['required_validation', 'type']}
      >
        <Radio.Group>
          <Radio value="Force">
            {I18n.t('administration.survey_builder.builder_area.force_response')}
          </Radio>
          <Radio value="Request">
            {I18n.t('administration.survey_builder.builder_area.request_response')}
          </Radio>
        </Radio.Group>
      </Form.Item>
    )}
  </>
)

const NotApplicableFormItem = ({ notApplicableEnabled }) => (
  <>
    <Form.Item
      className="mb-0"
      name={['not_applicable', 'enabled']}
      valuePropName="checked"
    >
      <Checkbox>
        {I18n.t('administration.survey_builder.builder_area.enable_not_applicable')}
      </Checkbox>
    </Form.Item>
    {notApplicableEnabled && (
      <Form.Item
        className="mb-6 ms-8"
        name={['not_applicable', 'label']}
        label={I18n.t('administration.survey_builder.builder_area.not_applicable_label')}
      >
        <Input />
      </Form.Item>
    )}
  </>
)

const JobRoleFormItem = ({ name }) => (
  <Form.Item
    className="mb-6 ms-8"
    rules={[{ required: true, message: I18n.t('administration.survey_builder.builder_area.job_role_required') }]}
    layout="horizontal"
    name={[name, 'job_roles']}
  >
    <Checkbox.Group
      options={[
        { value: 'current_job_role', label: I18n.t('administration.survey_builder.builder_area.current_job') },
        { value: 'target_job_role', label: I18n.t('administration.survey_builder.builder_area.target_job') },
      ]}
    >
      {I18n.t('administration.survey_builder.models.skill_types.technical')}
    </Checkbox.Group>
  </Form.Item>
)

export default BlockFooter
