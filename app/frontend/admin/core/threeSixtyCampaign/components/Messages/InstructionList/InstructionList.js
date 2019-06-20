import React, { useEffect, useState } from 'react'
import Editor from 'components/Editor'
import {
  Row, Col, Button, Empty, Icon, message,
} from 'antd'
import _ from 'lodash'
import routeUtils from 'utils/routeUtils'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import css from './style.scss'
import TemplateMenu from './TemplateMenu'

export default function InstructionList ({
  instructionTemplates: { list, selectedId },
  fetch,
  update,
  save,
  changeSelected,
  history,
  match: {
    params: { campaignId, id },
  },
}) {
  const changeTemplate = (templateId) => {
    routeUtils.moveTo(history, settings.urlPrefix, `/messages/instructions/${templateId}`)
    changeSelected(parseInt(templateId, 10))
  }

  useEffect(() => {
    fetch(campaignId, { selectedId: id })
      .then(({ response }) => {
        if (_.isUndefined(id) && !_.isEmpty(response)) {
          changeTemplate(response[0].id)
        } else if (!_.isEmpty(response)) {
          changeSelected(parseInt(id, 10))
        }
      })
  }, [])

  const [errors, setErrors] = useState(null)

  const selectedTemplate = _.find(list, ({ id }) => id === selectedId)
  if (_.isUndefined(selectedTemplate)) { return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }

  const saveTemplate = () => {
    save(campaignId, selectedTemplate)
      .then(() => {
        setErrors(null)
        message.success('Template saved successfully', 5)
      })
      .catch((errors) => {
        setErrors(errors)
      })
  }

  return (
    <Row className={css.container}>
      <Col xs={8} lg={7} xl={5}>
        <TemplateMenu instructionTemplates={list} selectedId={selectedId} changeTemplate={changeTemplate} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar
          instructionTemplate={selectedTemplate}
          toggleEnabled={() => { update('enabled', !selectedTemplate.enabled) }}
        />
        <div className={css.content}>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <Editor
            content={selectedTemplate.content}
            handleContentChange={(value) => { update('content', value) }}
          />
        </div>

        <Button
          type="primary"
          size="large"
          className="mtm mll"
          onClick={saveTemplate}
        >
          <Icon type="save" />
          Save
        </Button>
      </Col>
    </Row>
  )
}
