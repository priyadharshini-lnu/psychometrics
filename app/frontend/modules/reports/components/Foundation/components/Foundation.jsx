import { Component } from 'react'
import PropTypes from 'prop-types'
import interact from 'interact.js'
import cs from 'classnames'
import panelStore from '~/modules/reports/store/PropertyPanelStore'
import AppStore from '~/modules/reports/store/AppStore'
import styles from './Foundation.less'

const { $ } = window

class Foundation extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    aspectRatio: PropTypes.bool,
    children: PropTypes.node,
    preview: PropTypes.bool,
    outerStyle: PropTypes.object,
  }

  componentDidMount () {
    const { preview } = this.props
    if (preview) { return }
    this.applyInteract()
  }

  componentDidUpdate (prevProps) {
    const { preview, module } = this.props
    if (preview || !module) { return }
    if (prevProps.module.meta.hidden !== module.meta.hidden
      || prevProps.module.props.aspectRatio !== module.props.aspectRatio) {
      this.applyInteract()
    }
  }

  applyInteract = () => {
    if (!this.base) { return }
    const {
      aspectRatio,
    } = this.props
    interact(this.base)
      .draggable({
        manualStart: true,
        inertia: true,
        autoScroll: true,
        restrict: {
          restriction: this.base.parentNode,
          elementRect: {
            top: 0, left: 0, bottom: 1, right: 1,
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
    event.stopPropagation()
    const { preview, module } = this.props
    if (preview) {
      return
    }
    const $target = $(event.target)
    let x = module.props.position.left + event.dx
    let y = module.props.position.top + event.dy
    if (x < 0) x = 0
    if (y < 0) y = 0

    $target.css({ transform: `translate(${x}px, ${y}px)` })

    module.props.position.left = Math.round(x)
    module.props.position.top = Math.round(y)
  }

  dragEnd = () => {
    const { module } = this.props
    module.update()
  }

  resizeHandler = (event) => {
    const { module, preview } = this.props
    const $target = $(event.target)
    if (preview) {
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
    const {
      preview, module, closeRichEditor, selected, selectModule, unselectModules,
    } = this.props
    if (preview) { return }
    e.stopPropagation()
    if (module.meta.locked) { return }
    if (selected.moduleId === module.id) { return }

    const select = () => {
      unselectModules()
      selectModule('Module', module.id)
      closeRichEditor()
      panelStore.select('Module', module)
    }

    select()
  }

  keydown () {}

  render () {
    const {
      module, outerStyle: frameStyle, children, shadow, selected,
    } = this.props
    const mprops = module.props
    if (module.meta.hidden) { return null }
    const {
      left, top, width, height,
    } = mprops.position
    const { preview } = this.props

    const isSelected = selected.moduleId === module.id

    const style = {
      width,
      height,
      zIndex: isSelected ? 9999 : mprops.zIndex,
    }

    if (preview) {
      style.top = `${top}px`
      style.left = `${left}px`
    } else {
      style.transform = `translate(${left}px,${top}px)`
    }
    const className = cs(styles.base,
      {
        [styles.editor]: !preview,
        [styles.shadow]: shadow && !preview,
        [styles.selected]: isSelected,
        [styles.locked]: module.meta.locked,
      }, 'fe-module-container')
    return (
      <div
        ref={(ref) => { this.base = ref }}
        name={shadow ? '' : `Module_${module.id}`}
        className={className}
        style={style}
        onClick={this.select}
      >
        <div className={styles.sizeBox} ref={(ref) => { this.mover = ref }}>
          <i
            className={`fa fa-arrows ${styles.mover}`}
            data-right="true"
            data-bottom="true"
          />
          <div className={styles.label}>
            {` x:${Math.round(left)} y:${Math.round(top)} size:${Math.round(width)}x${Math.round(height)}`}
          </div>
        </div>
        <div className={`${styles.frame} fe-module-frame-container`} style={frameStyle}>
          {children}
        </div>
      </div>
    )
  }
}

export default Foundation
