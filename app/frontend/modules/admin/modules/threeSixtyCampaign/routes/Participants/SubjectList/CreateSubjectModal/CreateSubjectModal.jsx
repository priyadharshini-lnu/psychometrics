import { useState, useEffect, useCallback } from 'react'
import {
  Modal, Button, Form, Input, Select, Alert,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import { CheckOutlined, LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { getFeatures } from '~/core/config'
import { getCategory } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { camelizeKeys } from '~/utils/object'
import UserAutocomplete from '~/components/UserAutocomplete'
import { search } from '~/modules/admin/core/ui/autocomplete'

const { I18n } = window

function CreateSubjectModal ({
  closeModal,
  autocompletedUsers = [],
  createAll,
  errors,
  creationInProgress,
  clearForm,
  isSkillRater,
  features,
  search,
}) {
  const { campaignId, projectId } = useParams()
  const [form] = Form.useForm()
  const [autocompletedUser, setAutocompletedUser] = useState('')

  const [jobRoleFilter, setJobRoleFilter] = useState('')
  const {
    data: jobRoles = [],
    fetch: fetchJobRoles,
    isLoading: fetchingJobRoles,
  } = useResources('job_roles', {
    apiConfig: {
      query: {
        project_id: projectId,
      },
      filter: {
        name_or_code_cont: jobRoleFilter,
      },
    },
  })

  const skillRaterEnabled = camelizeKeys(features ?? {})?.skillRaterEnabled

  const debouncedFetchJobRoles = useCallback(
    debounce((value) => {
      setJobRoleFilter(value)
      fetchJobRoles({
        apiConfig: {
          query: {
            project_id: projectId,
          },
          filter: {
            name_or_code_cont: value,
          },
        },
      })
    }, 300),
    [projectId, fetchJobRoles],
  )

  useEffect(() => () => {
    clearForm()
  }, [])

  useEffect(() => {
    if (skillRaterEnabled && isSkillRater) {
      debouncedFetchJobRoles('')
    }
  }, [skillRaterEnabled, isSkillRater, projectId])

  const onJobRoleSearch = (value) => {
    debouncedFetchJobRoles(value)
  }

  const onSelectUser = (user) => {
    const data = JSON.parse(user)
    setAutocompletedUser(data.email)

    // Pre-populate form fields
    form.setFieldsValue({
      email: data.email,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      locale: data.locale,
    })
  }

  const handleSubmit = async (values) => {
    // Validate for whitespace before submitting
    const trimmedValues = {
      ...values,
      email: values.email?.trim(),
      firstName: values.firstName?.trim(),
      lastName: values.lastName?.trim(),
    }

    // Check if required fields are just whitespace
    if (!trimmedValues.email || !trimmedValues.firstName || !trimmedValues.lastName) {
      form.validateFields()
      return
    }


    await createAll(campaignId, [trimmedValues])
    closeModal()
  }

  return (
    <Modal
      width={550}
      title={I18n.t('admin.add_subjects')}
      open
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={creationInProgress}
          onClick={() => form.submit()}
        >
          {(creationInProgress) ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.add')}
        </Button>,
      ]}
    >
      {(errors) && (
        <Alert
          message={
            typeof errors === 'object' ? Object.values(errors).join(', ')
              : (errors || I18n.t('shared.something_wrong'))
          }
          type="error"
          className="mb-4"
          showIcon
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="email"
          label={I18n.t('shared.email')}
          rules={[
            {
              required: true,
              message: I18n.t('validations.blank'),
            },
            {
              type: 'email',
              message: I18n.t('validations.email'),
            },
          ]}
        >
          <UserAutocomplete
            value={autocompletedUser}
            onChange={(value) => {
              setAutocompletedUser(value)
              form.validateFields(['email'])
            }}
            onSelect={onSelectUser}
            source="users"
            users={autocompletedUsers}
            url={`/administration/projects/${projectId}/search_users`}
            search={search}
            searchOnChange
          />
        </Form.Item>

        <Form.Item
          name="firstName"
          label={I18n.t('shared.first_name')}
          rules={[
            {
              required: true,
              whitespace: true,
              message: I18n.t('validations.blank'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={I18n.t('shared.last_name')}
          rules={[
            {
              required: true,
              whitespace: true,
              message: I18n.t('validations.blank'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="locale"
          label={I18n.t('admin.locale')}
        >
          <Input />
        </Form.Item>

        {skillRaterEnabled && isSkillRater && (
          <>
            <Form.Item
              name="currentJobRole"
              label={I18n.t('admin.current_job_role')}
            >
              <Select
                allowClear
                showSearch
                filterOption={false}
                notFoundContent={fetchingJobRoles ? <LoadingOutlined /> : null}
                onSearch={onJobRoleSearch}
                onFocus={() => debouncedFetchJobRoles('')}
              >
                {jobRoles.map(role => (
                  <Select.Option key={role.id} value={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="targetJobRole"
              label={I18n.t('admin.target_job_role')}
            >
              <Select
                allowClear
                showSearch
                filterOption={false}
                notFoundContent={fetchingJobRoles ? <LoadingOutlined /> : null}
                onSearch={onJobRoleSearch}
                onFocus={() => debouncedFetchJobRoles('')}
              >
                {jobRoles.map(role => (
                  <Select.Option key={role.id} value={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  )
}

const mapStateToProps = state => ({
  features: getFeatures(state),
  isSkillRater: getCategory(state) === 'skill_rater',
})

const mapDispatchToProps = {
  search,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSubjectModal)
