import { useState, useEffect, useCallback } from 'react'
import {
  Modal, Button, Form, Input, Select,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import debounce from 'lodash/debounce'
import { isSuperAdmin } from '~/core/currentUser'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import { getFeatures } from '~/core/config'
import { useResources } from '~/hooks/useResources'
import { camelizeKeys } from '~/utils/object'

const { Option } = Select

function UserEditModal ({
  closeModal,
  update,
  save,
  user: {
    email,
    firstName,
    lastName,
    currentJobRole,
    targetJobRole,
  },
  user,
  currentUser,
  onUserUpdate,
  saveInProgress,
  features,
}) {
  const { campaignId, projectId } = useParams()
  const [errors, setErrors] = useState(null)
  const [jobRoleFilter, setJobRoleFilter] = useState('')
  const {
    data: jobRoles = [],
    fetch: fetchJobRoles,
    isLoading: fetchingJobRoles,
  } = useResources('job_roles', {
    apiConfig: {
      project_id: projectId,
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
          project_id: projectId,
          filter: {
            name_or_code_cont: value,
          },
        },
      })
    }, 300),
    [projectId, fetchJobRoles],
  )

  useEffect(() => {
    if (skillRaterEnabled) {
      debouncedFetchJobRoles('')
    }
  }, [skillRaterEnabled, projectId])

  useEffect(() => {
    if (!jobRoles.length) return

    if (typeof currentJobRole === 'string') {
      const match = jobRoles.find(r => r.name === currentJobRole)
      if (match) update('currentJobRole', match.id)
    }

    if (typeof targetJobRole === 'string') {
      const match = jobRoles.find(r => r.name === targetJobRole)
      if (match) update('targetJobRole', match.id)
    }
  }, [jobRoles])

  const handleOnCancel = () => {
    closeModal()
  }

  const handleInputChange = ({ target: { name, value } }) => {
    update(name, value)
  }

  const handleSelectChange = (name, value) => {
    update(name, value)
  }

  const handleJobRoleSearch = (value) => {
    debouncedFetchJobRoles(value)
  }

  const handleJobRoleFocus = () => {
    debouncedFetchJobRoles('')
  }

  const handleSave = () => {
    const userPayload = { ...user }

    if (!skillRaterEnabled) {
      delete userPayload.currentJobRole
      delete userPayload.targetJobRole
    }

    save(campaignId, userPayload).then(() => {
      closeModal()
      onUserUpdate()
    }).catch(setErrors)
  }

  const saveButtonIcon = () => {
    if (saveInProgress) {
      return <LoadingOutlined />
    }
    return <CheckOutlined />
  }

  return (
    <Modal
      width={650}
      title={I18n.t('threesixty.edit_user')}
      open
      onCancel={handleOnCancel}
      footer={[
        <Button key="back" onClick={handleOnCancel}>
          {I18n.t('threesixty.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          disabled={saveInProgress}
        >
          {saveButtonIcon()}
          {I18n.t('threesixty.save')}
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mtl mbl" />
      <Form layout="vertical">
        <Form.Item label="Email">
          <Input value={email} name="email" disabled={!isSuperAdmin(currentUser)} onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="First Name">
          <Input value={firstName} name="firstName" onChange={handleInputChange} />
        </Form.Item>
        <Form.Item label="Last Name">
          <Input value={lastName} name="lastName" onChange={handleInputChange} />
        </Form.Item>
        {skillRaterEnabled && (
          <>
            <Form.Item label="Current Job Role">
              <Select
                value={currentJobRole}
                onChange={value => handleSelectChange('currentJobRole', value)}
                placeholder="Select current job role"
                allowClear
                showSearch
                filterOption={false}
                notFoundContent={fetchingJobRoles ? <LoadingOutlined /> : null}
                onSearch={handleJobRoleSearch}
                onFocus={handleJobRoleFocus}
              >
                {jobRoles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Target Job Role">
              <Select
                value={targetJobRole}
                onChange={value => handleSelectChange('targetJobRole', value)}
                placeholder="Select target job role"
                allowClear
                showSearch
                filterOption={false}
                notFoundContent={fetchingJobRoles ? <LoadingOutlined /> : null}
                onSearch={handleJobRoleSearch}
                onFocus={handleJobRoleFocus}
              >
                {jobRoles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
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
})
export default connect(mapStateToProps)(UserEditModal)
