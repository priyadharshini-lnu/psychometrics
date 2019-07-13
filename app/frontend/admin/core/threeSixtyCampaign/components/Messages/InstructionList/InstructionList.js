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
  instructionTemplates: { list },
  fetch,
  update,
  save,
  history,
  match: {
    params: { campaignId, id: selectedId },
  },
}) {
  useEffect(() => {
    fetch(campaignId)
      .then(({ response }) => {
        if (!selectedId) {
          routeUtils.moveTo(history, settings.urlPrefix, `/messages/instructions/${response[0].id}`)
        }
      })
  }, [])

  const [errors, setErrors] = useState(null)

  const selectedTemplate = _.find(list, ({ id }) => id === parseInt(selectedId, 10))
  if (!selectedTemplate) { return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }

  const saveTemplate = () => {
    save(campaignId, selectedTemplate)
      .then(() => {
        setErrors(null)
        message.success('Template saved successfully', 5)
      })
      .catch(setErrors)
  }

  return (
    <Row className={css.container}>
      <Col xs={8} lg={7} xl={5}>
        <TemplateMenu history={history} instructionTemplates={list} selectedId={selectedId} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar
          instructionTemplate={selectedTemplate}
          toggleEnabled={() => { update(selectedTemplate.id, 'enabled', !selectedTemplate.enabled) }}
        />
        <div className={css.content}>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <Editor
            type={selectedTemplate.name}
            content={selectedTemplate.content}
            handleContentChange={(value) => { update(selectedTemplate.id, 'content', value) }}
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
