import { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Divider, Form, Form as AntForm,
} from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import cs from 'classnames'
import SpreadSheet from '~/components/SpreadSheet'
import spreadSheetUtils from '~/modules/admin/utils/spreadSheet'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import userPresenter from '~/presenters/user'
import UserAutocomplete from '~/components/UserAutocomplete'
import { setIn } from '~/utils/immutable'
import { useResources } from '~/hooks/useResources'
import { getFeatures } from '~/core/config'

import styles from './CreateSubjectModal.less'
import { getCategory } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'

const { I18n } = window

const getTableFields = (jobRoles, isSkillRater) => {
  const fields = [
    { name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.email'), key: 'email' },
    { name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.first_name'), key: 'firstName' },
    { name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.last_name'), key: 'lastName' },
    { name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.locale'), key: 'locale' },
  ]

  if (isSkillRater) {
    fields.push(
      {
        name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.current_job_role'),
        key: 'currentJobRole',
        type: 'Select',
        values: () => jobRoles?.map(role => ({
          label: role.name,
          value: role.name,
        })) || [],
      },
      {
        name: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.target_job_role'),
        key: 'targetJobRole',
        type: 'Select',
        values: () => jobRoles?.map(role => ({
          label: role.name,
          value: role.name,
        })) || [],
      },
    )
  }

  return fields
}


const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 12 } }

function CreateSubjectModal ({
  closeModal,
  autocompletedUsers,
  fillSubjects,
  createAll,
  errors,
  subjects,
  creationInProgress,
  clearForm,
  isSkillRater,
  features,
}) {
  const { campaignId, projectId } = useParams()
  useEffect(() => () => {
    clearForm()
  }, [])

  const [autocompletedUser, setAutocompletedUser] = useState('')

  const handleOk = () => createAll(campaignId, _.filter(subjects, s => s.email || s.lastName || s.firstName))

  const onSelect = (user) => {
    const data = JSON.parse(user)
    const newSubjects = setIn(subjects, spreadSheetUtils.getFreeRowIndex(subjects), _.omit(data, ['id']))
    setAutocompletedUser(userPresenter.getFullNameWithEmail(data))
    fillSubjects(newSubjects)
  }

  const {
    data: jobRoles = [],
    fetch: fetchJobRoles,
  } = useResources(`job_roles?project_id=${projectId}`)

  useEffect(() => {
    fetchJobRoles()
  }, [])
  const skillRaterEnabled = features?.skill_rater_enabled

  return (
    <Modal
      width="70%"
      title={I18n.t('administration.threesixty_campaigns.menu.participants.subjects.add_subjects')}
      open
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button key="submit" type="primary" disabled={creationInProgress} onClick={handleOk}>
          <CheckOutlined />
          {I18n.t('common.actions.add')}
        </Button>,
      ]}
    >
      <Form {...formItemLayout} autoComplete="off">
        <AntForm.Item label="Subject">
          <UserAutocomplete
            value={autocompletedUser}
            onChange={setAutocompletedUser}
            onSelect={onSelect}
            source="users"
            users={autocompletedUsers}
            placeholder="Search Subject..."
            url={`/administration/projects/${projectId}/search_users`}
          />
        </AntForm.Item>
      </Form>
      <Divider />
      <SpreadSheet
        entities={subjects}
        fields={getTableFields(jobRoles, (skillRaterEnabled && isSkillRater))}
        updateEntities={fillSubjects}
        className={cs({ [styles.spreadSheet]: skillRaterEnabled && isSkillRater })}
      />
      <ErrorAlertBox errors={errors} />
    </Modal>
  )
}

const mapStateToProps = state => ({
  features: getFeatures(state),
  isSkillRater: getCategory(state) === 'skill_rater',
})

export default connect(mapStateToProps)(CreateSubjectModal)
