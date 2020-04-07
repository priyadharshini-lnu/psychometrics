import React, { Component } from 'react'
import _ from 'lodash'
import HeaderDispatcher from 'rb/dispatchers/HeaderDispatcher'
import ClipboardDispatcher from 'rb/dispatchers/ClipboardDispatcher'
import headerStore from 'rb/store/HeaderStore'
import AppStore from 'rb/store/AppStore'
import I18nStore from 'rb/store/I18nStore'
import styles from './FixedHeader.scss'

const { $ } = window

export class HomeView extends Component {
  componentDidMount () {
    $(document).on('scroll', this.bodyScroll)
    $(document).on('keydown', this.bodyKeyDown)
    this.listener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    $(document).off('scroll', this.bodyScroll)
    $(document).off('keydown', this.bodyKeyDown)
    this.listener.remove()
  }

  bodyScroll = (e) => {
    headerStore.offset = $(this.menu).offset().top
    HeaderDispatcher.updatePage($(e.currentTarget).scrollTop())
  }

  bodyKeyDown = (e) => {
    const { richEditorOpened } = this.props
    if (e.target.nodeName === 'INPUT') { return }
    if (e.target.nodeName === 'TEXTAREA') { return }
    if (richEditorOpened) { return }

    if (e.keyCode === 8 || e.keyCode === 46) {
      HeaderDispatcher.backspace()
    }

    if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
      ClipboardDispatcher.copy()
    }

    if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
      const $menu = $(this.menu)
      ClipboardDispatcher.paste($menu.offset().top)
    }
  }

  addText = () => {
    const $menu = $(this.menu)
    HeaderDispatcher.addModule('Text', $menu.offset().top)
  }

  addImage = () => {
    const $menu = $(this.menu)
    HeaderDispatcher.addModule('Image', $menu.offset().top)
  }

  addShape = () => {
    const $menu = $(this.menu)
    HeaderDispatcher.addModule('Shape', $menu.offset().top)
  }

  addGraph = () => {
    const $menu = $(this.menu)
    HeaderDispatcher.addModule('Graph', $menu.offset().top)
  }

  addTable = () => {
    const $menu = $(this.menu)
    HeaderDispatcher.addModule('Table', $menu.offset().top)
  }


  export = () => {
    this.data.value = JSON.stringify(I18nStore.exportReport())
    this.form.submit()
  }

  save = (e) => {
    const target = e.currentTarget
    target.setAttribute('disabled', 'disabled')
    AppStore.save(() => {
      target.removeAttribute('disabled')
    })
  }

  openFilterModal = () => {
    const { openFilter } = this.props
    openFilter({ filters: AppStore.report.filters })
  }

  openDataSheetModal = () => {
    const { openDataSheet } = this.props
    openDataSheet({ columns: AppStore.report.dataSheetColumns })
  }

  openAliasModal = () => {
    const { openAlias } = this.props
    openAlias({ factors: AppStore.flatFactors })
  }

  openDataConfigurationModal = () => {
    const { openDataConfiguration } = this.props
    openDataConfiguration()
  }

  render () {
    const { richEditorOpened } = this.props
    const style = {
      position: 'fixed',
      top: 0,
      minWidth: 0,
      left: 0,
      width: '100%',
    }

    return (
      <div ref={(ref) => { this.menu = ref }} className={styles.header} style={style}>
        {richEditorOpened ? <div key="editor" id="froala-editor-toolbar" /> : (
          <div key="menu" className={styles.components}>
            <div
              ref={(ref) => { this.cktoolbar = ref }}
              className={styles.ckContainer}
              style={{ display: headerStore.showCK ? 'block' : 'none' }}
            />
            <div className={styles.set}>
              <a onClick={this.addTable}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-table" />
                Table
              </a>
              <a onClick={this.addGraph}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-bar-chart" />
                Graph
              </a>
              <a onClick={this.addShape}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-square-o" />
                Shape
              </a>
              <a onClick={this.addText}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-font" />
                Text
              </a>
              <a onClick={this.addImage}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-image" />
                Image
              </a>
            </div>
            <div className={`${styles.set} ${styles.rightSet}`}>
              <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
                <i className="fa fa-save" />
                Save
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-default dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true"
                >
                  <span className="fa fa-gear" />
                  Report Options
                  <span className="caret" />
                </button>
                <ul className="dropdown-menu">
                  <li><a onClick={this.openFilterModal}>Manage Filters</a></li>
                  <li><a onClick={this.openDataSheetModal}>Manage DataSheets</a></li>
                  <li><a onClick={this.export}>Export Translations</a></li>
                  <li>
                    <a
                      className={styles.linkExport}
                      data-remote="true"
                      href={`/administration/translations/reports/${_.result(AppStore.report, 'id')}/new`}
                    >
                      Import Translations
                    </a>

                  </li>
                  <li><a href={`/administration/reports/${_.result(AppStore.report, 'id')}/preview`}>Preview</a></li>
                  <li><a onClick={this.openAliasModal}>Aliases</a></li>
                  <li><a onClick={this.openDataConfigurationModal}>Data Report Configuration</a></li>
                </ul>
                <form
                  style={{ display: 'none' }}
                  ref={(ref) => { this.form = ref }}
                  action={`/administration/translations/reports/${_.result(AppStore.report, 'id')}/export`}
                  method="POST"
                >
                  <input name="authenticity_token" type="hidden" value={$('meta[name=csrf-token]').attr('content')} />
                  <input ref={(ref) => { this.data = ref }} name="data" />
                </form>
              </div>
              <div>
                <a href="/administration/reports" className={`btn btn-default ${styles.back}`}>Back</a>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default HomeView
