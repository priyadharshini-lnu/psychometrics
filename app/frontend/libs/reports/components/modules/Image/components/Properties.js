import React, { Component } from 'react'
import styles from 'rb/views/PropertyPanel/components/PropertyPanel.scss'
import store from 'rb/store/PropertyPanelStore'
import ConditionImageStore from 'rb/store/modals/ConditionImageStore'
import { LibraryStore } from 'libs/library'
import LibraryTransport from 'rb/cable/LibraryChannel'
import Socket from 'rb/cable'
import Select from 'react-select'
import AssessmentProperties from 'rb/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from 'rb/components/modules/CommonMethods/clearAfterAssessmentChange'
import AppStore from 'rb/store/AppStore'
import { getValue } from 'rb/presenters/ReactSelectPresenter'

const TYPE_OPTIONS = [
  { label: 'Simple Image', value: 'SimpleImage' },
  { label: 'Conditional Image', value: 'ConditionalImage' },
]

class Properties extends Component {
  componentWillMount () {
    const type = store.model.props.sourceType
    store.model.props.sourceType = type || 'SimpleImage'
  }

  componentDidMount () {
    LibraryTransport.init()
    this.librarySocket = Socket.library()
  }

  update = () => {
    store.model.update()
    this.forceUpdate()
  }

  changeUrl = (e) => {
    const val = e.currentTarget.value
    store.model.props.url = val
    store.model.update()
  }

  openLibrary = () => {
    LibraryStore.openPopup(this.librarySocket, this.onSelectGraphic, 'image')
  }

  onSelectGraphic = (item) => {
    store.model.props.url = item.file
    this.forceUpdate()
  }

  changeSourceType = (obj) => {
    store.model.props.sourceType = obj.value
    if (store.model.props.sourceType === 'ConditionalImage') {
      store.model.props.url = null
    }
    this.update()
  }

  openConditionModal = () => {
    ConditionImageStore.open(store.model)
  }

  changeAssessment = (assessmentId) => {
    const { model } = this.props
    model.assessment_id = assessmentId
    clearAfterAssessmentChange(model)
    this.update()
  }

  expand = () => {
    const { model } = this.props
    model.props.position.left = 0
    model.props.position.top = 0
    model.props.position.width = AppStore.report.props.sizes.width
    model.props.position.height = AppStore.report.props.sizes.height
    this.update()
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <div className={styles.title}>Image Options</div>
        {<AssessmentProperties assessmentId={model.assessment_id} changeAssessment={this.changeAssessment} />}
        <hr className={styles.divider} />
        <div className="margin-top-10 margin-bottom-10">
          <Select
            name="form-field-name"
            value={getValue(TYPE_OPTIONS, store.model.props.sourceType)}
            options={TYPE_OPTIONS}
            getOptionValue={opt => opt.value}
            autoFocus={false}
            clearable={false}
            onChange={this.changeSourceType}
          />
          {store.model.props.sourceType === 'ConditionalImage'
            && (
            <div
              style={{ width: '100%' }}
              onClick={this.openConditionModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
            )}
          {
            store.model.props.sourceType === 'SimpleImage'
            && (
            <div>
              <div className={styles.block}>
                <a onClick={this.openLibrary} className={styles.text}>Choose Image</a>
              </div>
              <div className={styles.block}>
                <label className={styles.inputLabel}>
                  Url
                </label>
                <input onChange={this.changeUrl} />
              </div>
            </div>
            )
          }
          <div className={styles.block}>
            <button className="btn btn-default" onClick={this.expand}>Expand to page sizes</button>
          </div>
        </div>
        <hr className={styles.divider} />
      </div>
    )
  }
}

export default Properties
