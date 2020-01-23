import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import interact from 'interact.js'
import store from 'rb/store/PageList'
import panelStore from 'rb/store/PropertyPanelStore'
import AppStore from 'rb/store/AppStore'
import ScrollDispatcher from 'rb/dispatchers/ScrollDispatcher'
import RichEditorStore from 'rb/store/RichEditorStore'
import styles from './Foundation.scss'

const { $ } = window

class Foundation extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    aspectRatio: PropTypes.bool,
    children: PropTypes.node,
    preview: PropTypes.bool,
    outerStyle: PropTypes.object,
  }

  componentDidMount () {
    const {
      module, page, preview, aspectRatio,
    } = this.props
    const shadow = !module.onPage(page) && module.props.showOnAllPages
    if (shadow || preview) { return }
    interact(this.base)
      .draggable({
        manualStart: true,
        inertia: true,
        autoScroll: true,
        restrict: {
          restriction: 'parent',
          elementRect: {
            left: true, right: true, bottom: true, top: true,
          },
        },
        onmove: this.dragHandler,
        onend: this.dragEnd,
      })
      .resizable({
        preserveAspectRatio: aspectRatio,
        autoScroll: true,
        edges: {
          left: true, right: true, bottom: true, top: true,
        },
        restrict: {
          restriction: 'parent',
        },
      }).on('resizemove', this.resizeHandler)
      .on('resizeend', this.dragEnd)

    interact(this.mover)
      .on('down', (event) => {
        const { interaction } = event
        const handle = event.currentTarget

        interaction.start(
          {
            name: 'drag',
            edges: {
              top: handle.dataset.top,
              left: handle.dataset.left,
              bottom: handle.dataset.bottom,
              right: handle.dataset.right,
            },
          },
          interact(this.base), // target Interactable
          this.base,
        ) // target Element
      })
  }

  dragHandler = (event) => {
    const { preview, module } = this.props
    if (preview || module !== panelStore.model) {
      return
    }
    const $target = $(event.target)
    let x = module.props.position.left + event.dx
    let y = module.props.position.top + event.dy
    if (x < 0) x = 0
    if (y < 0) y = 0

    $target.css({ transform: `translate(${x}px, ${y}px)` })

    module.props.position.left = x
    module.props.position.top = y
  }

  dragEnd = () => {
    const { module } = this.props
    module.update()
  }

  resizeHandler = (event) => {
    const { module, preview } = this.props
    const $target = $(event.target)
    if (preview || module !== panelStore.model) {
      return
    }
    let x = module.props.position.left
    let y = module.props.position.top
    let width = event.rect.width - 1
    let height = event.rect.height - 1
    $target.css({ width: `${width}px`, height: `${height}px` })

    const pageSizes = AppStore.report.props.sizes
    x += event.deltaRect.left
    y += event.deltaRect.top
    if (x < 0) x = 0
    if (y < 0) y = 0
    // eslint-disable-next-line prefer-destructuring
    if (width > pageSizes.width) width = pageSizes.width
    // eslint-disable-next-line prefer-destructuring
    if (height > pageSizes.height) height = pageSizes.height
    $target.css({ transform: `translate(${x}px, ${y}px)` })

    module.props.position.left = x
    module.props.position.top = y
    module.props.position.width = width
    module.props.position.height = height
  }


  select = (e) => {
    const { preview, module, page } = this.props
    if (preview) { return }
    e.stopPropagation()
    const shadow = !module.onPage(page) && module.props.showOnAllPages

    const selectModule = () => {
      store.unselectAll()
      store.selected.push(module)
      RichEditorStore.close()
      panelStore.select('Module', module)
      this.forceUpdate()
    }

    if (shadow) {
      ScrollDispatcher.scroll(module.store.page.id, `Module_${module.id}`, () => {
        selectModule()
      })
      return
    }
    selectModule()
  }

  keydown (e) {
    console.log(e.keyCode)
  }

  render () {
    const {
      module, outerStyle: frameStyle, children, page,
    } = this.props
    const mprops = module.props
    const {
      left, top, width, height,
    } = mprops.position
    const { preview } = this.props

    const style = {
      width,
      height,
      zIndex: mprops.zIndex,
    }

    if (preview) {
      style.top = `${top}px`
      style.left = `${left}px`
    } else {
      style.transform = `translate(${left}px,${top}px)`
    }

    const selected = _.find(store.selected, module)
    const shadow = !module.onPage(page) && module.props.showOnAllPages
    const className = `${styles.base} ${shadow && !preview ? styles.shadow : ''} ${selected ? styles.selected : ''}`
    return (
      <div
        ref={(ref) => { this.base = ref }}
        name={shadow ? '' : `Module_${module.id}`}
        className={`${className} fe-module-container`}
        style={style}
        onClick={this.select}
      >
        <div className={`${styles.frame} fe-module-frame-container`} style={frameStyle}>
          {children}
        </div>
        <i
          className={`fa fa-arrows ${styles.mover} ${!selected ? 'hidden' : ''}`}
          data-right="true"
          data-bottom="true"
          ref={(ref) => { this.mover = ref }}
        />
      </div>
    )
  }
}

export default Foundation
