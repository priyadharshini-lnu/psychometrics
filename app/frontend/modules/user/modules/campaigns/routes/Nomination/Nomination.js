/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react'
import {
  Layout, PageHeader, Alert,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import _ from 'lodash'

import NominationForm from './NominationForm/NominationForm'
import NominationTable from './NominationTable/NominationTable'
import NameModal from './NominationForm/NameModal'
import './styles.scss'

const { Content } = Layout

export default function Nominations (props) {
  useEffect(() => {
    props.fetchNomination(props.match.params)
  }, [])

  const [showPrompt, setShowPrompt] = useState(false)
  const [participant, setParticipant] = useState(null)

  const {
    addNomination, instructions, nomination:
    { isSelf, options: { participants: options }, evalautionCompletedForSubject },
  } = props
  const instruction = _.find(instructions, { name: 'invite_evaluators' })
  const hasNominationPermission = isSelf ? options.subject.canNominateEvaluators : options.manager.canChooseEvaluators
  const canNominate = hasNominationPermission && !evalautionCompletedForSubject

  const handleAddNomination = values => addNomination({
    ...values,
  }).catch((errors) => {
    if (!errors) { return }
    const { firstName, lastName, ...rest } = errors
    if (_.isEmpty(rest) && (firstName || lastName)) {
      setParticipant({ ...values })
      setShowPrompt(true)
    }
  })

  const handleAdd = (values) => {
    addNomination({
      ...participant, ...values,
    }).then(() => {
      setShowPrompt(false)
    }).catch(() => {
      setShowPrompt(false)
    })
  }

  const { nomination: { loaded } } = props
  if (!loaded) { return null }

  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={(
              <div>
                <ArrowLeftOutlined />
                {' '}
                {I18n.t('threesixty.back_to_tasks')}
              </div>
            )}
            title="Nomination"
            onBack={() => props.history.push(`/threesixty_campaigns/${props.match.params.campaignId}`)}
          />
        </Content>
      </div>
      <Content className="fluid-container">
        <div className="mtl mbl">
          <div className="nominations-container">
            {hasNominationPermission && evalautionCompletedForSubject && (
            <Alert
              message={I18n.t('threesixty.evaluation_closed_nomination_message')}
              className="mbm"
              type="info"
              showIcon
            />
            )}
            {instruction && (
              <div className="content">
                <div dangerouslySetInnerHTML={{ __html: instruction.content }} />
              </div>
            )}
            {canNominate && (
            <NominationForm
              {...props}
              handleAddNomination={handleAddNomination}
              setShowPrompt={setShowPrompt}
            />
            )}
            <NominationTable
              {...props}
              handleAddNomination={handleAddNomination}
              canNominate={canNominate}
              setShowPrompt={setShowPrompt}
              setParticipant={setParticipant}
            />
            <NameModal
              participant={participant}
              showPrompt={showPrompt}
              setShowPrompt={setShowPrompt}
              handleAdd={handleAdd}
            />
          </div>
        </div>
      </Content>
    </Layout>
  )
}
