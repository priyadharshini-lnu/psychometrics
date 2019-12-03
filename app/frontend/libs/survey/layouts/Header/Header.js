import _ from 'lodash'
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import AppStore from 'store/AppStore'
import ActionsHistory from 'components/ActionsHistory'
import CreateByTemplateStore from 'store/CreateByTemplateStore'
import MappingNormsStore from 'store/MappingNormsStore'
import styles from './Header.scss'

export class Header extends Component {
  componentDidMount () {
    this.appListener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.appListener.remove()
  }

  openFlow = () => {
    const { openFlow } = this.props
    openFlow()
  }

  createBlock = () => {
    const { createBlock } = this.props
    createBlock()
  }

  showScoring = () => {
    const { history, match: { params: { id } } } = this.props
    history.push(`/administration/assessments/${id}/scoring`)
  }

  openSearchPopup = () => {
    CreateByTemplateStore.openBlockPopup(null, 'Block')
  }

  showMappingNorms = () => {
    MappingNormsStore.openPopup()
  }

  export = () => {
    const { blocks } = this.props
    const result = {
      question: {},
      flow: {},
    }
    _.each(blocks, (block) => {
      _.each(block.questions.list, (question) => {
        result.question[question.id] = question.exportLocales()
      })
    })
    this.data.value = JSON.stringify(result)
    this.form.submit()
  }

  openPreview = () => {
    this.previewData.value = JSON.stringify(AppStore.serializeAssessment())
    this.previewForm.submit()
  }

  save = () => {
    const { builder } = this.props
    AppStore.save(builder)
  }

  toggleEnableBack = () => {
    AppStore.assessment.toggleEnableBack()
    this.forceUpdate()
  }

  toggleEnableProgress = () => {
    AppStore.assessment.toggleEnableProgress()
    this.forceUpdate()
  }

  render () {
    const { assessment } = this.props
    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div>
          <h3 className="panel-title">
            {assessment.name}
          </h3>
        </div>
        <ul className="panel-controls">
          <li>
            <button className={`btn btn-default ${styles.flow}`} onClick={this.openFlow}>Flow</button>
          </li>
          <li>
            <button onClick={this.openPreview} className={`btn btn-default ${styles.preview}`}>
              Preview
            </button>
          </li>
          <li>
            <button onClick={this.showScoring} className={`btn btn-default ${styles.preview}`}>
              Scoring
            </button>
          </li>
          <li>
            <button onClick={this.showMappingNorms} className={`btn btn-default ${styles.preview}`}>
              Map norms
            </button>
          </li>

          {AppStore.assessment && (
            <li>
              <span>
                <a
                  href={`/administration/reports?q[assessment_id_in][]=${AppStore.assessment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-default ${styles.preview}`}
                >
                Reports
                </a>
              </span>
            </li>
          )}
          <li className={styles.spaceLeft}><ActionsHistory /></li>
          <li>
            <DropdownButton
              className={styles.dropdown}
              pullRight
              bsStyle="default"
              title={(
                <span>
                  <span className="icon fa fa-gear" />
                  Options
                </span>
              )}
              id="main_menu"
            >
              <MenuItem onSelect={this.createBlock}>Add Block</MenuItem>
              <MenuItem onSelect={this.openSearchPopup}>Copy Block From...</MenuItem>
              <MenuItem onSelect={this.export}>Export Translations</MenuItem>
              <li>
                <a
                  className={styles.linkExport}
                  data-remote="true"
                  href={`/administration/translations/assessments/${_.result(AppStore.assessment, 'id')}/new`}
                >
                  Import Translations
                </a>
              </li>
              <li>
                <a
                  className={styles.linkExport}
                  href={`/administration/assessments/${_.result(AppStore.assessment, 'id')}/export.xlsx`}
                >
                  Export Scoring
                </a>
              </li>
              <MenuItem onSelect={this.toggleEnableBack}>
                {_.result(AppStore.assessment, 'enable_back') ? 'Disable Back Button' : 'Enable Back Button'}
              </MenuItem>
              <MenuItem onSelect={this.toggleEnableProgress}>
                {_.result(AppStore.assessment, 'enable_progress') ? 'Disable Progress Bar' : 'Enable Progress Bar'}
              </MenuItem>
            </DropdownButton>
            <form
              style={{ display: 'none' }}
              ref={(ref) => { this.form = ref }}
              action={`/administration/translations/assessments/${_.result(AppStore.assessment, 'id')}/export`}
              method="POST"
            >
              <input
                name="authenticity_token"
                type="hidden"
                value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
              />
              <input ref={(ref) => { this.data = ref }} name="data" />
            </form>
            <form
              style={{ display: 'none' }}
              ref={(ref) => { this.previewForm = ref }}
              target="_blank"
              action={`${location.pathname}/preview`}
              method="POST"
            >
              <input
                name="authenticity_token"
                type="hidden"
                value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
              />
              <input ref={(ref) => { this.previewData = ref }} name="data" />
            </form>
          </li>
          <li>
            <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
              <i className="fa fa-save" />
              Save
            </button>
          </li>
        </ul>
      </div>
    )
  }
}

export default Header
