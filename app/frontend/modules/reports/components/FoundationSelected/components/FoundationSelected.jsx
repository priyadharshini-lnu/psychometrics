import {
  useEffect, useRef,
} from 'react'
import interact from 'interactjs'
import cs from 'classnames'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import { useForceUpdate } from '@react-spring/shared'
import styles from './FoundationSelected.less'


const { $ } = window

const getRotatedPoints = ({
  left: x, top: y, width: w, height: h,
}, angle = 0) => {
  const rad = angle * Math.PI / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = x + w / 2
  const cy = y + h / 2

  const rx = (x, y) => Math.round(cx + ((x - cx) * cos - (y - cy) * sin))
  const ry = (x, y) => Math.round(cy + ((x - cx) * sin + (y - cy) * cos))

  return [
    { x: rx(x, y), y: ry(x, y) },
    { x: rx(x + w, y), y: ry(x + w, y) },
    { x: rx(x + w, y + h), y: ry(x + w, y + h) },
    { x: rx(x, y + h), y: ry(x, y + h) },
  ]
}


const FoundationSelected = ({
  modules, aspectRatio, pageId, selectedPageId, currentPage, pageSize,
}) => {
  const forceUpdate = useForceUpdate()
  const selectedIds = useSelector(state => state.report.ui.selection.selected)
  const preserveRatio = interact.modifiers.aspectRatio({ ratio: 'preserve', enabled: false })
  const applyInteract = () => {
    interact(base.current)
      .draggable({
        manualStart: true,
        inertia: true,
        autoScroll: true,
        modifiers: [
          interact.modifiers.restrict({
            restriction: base.current.parentNode,
            elementRect: {
              top: 0, left: 0, bottom: 1, right: 1,
            },
          }),
        ],
        listeners: {
          start: startHandler,
          move: dragHandler,
          end: dragEnd,
        },
      })
      .resizable({
        preserveAspectRatio: aspectRatio,
        autoScroll: true,
        edges: {
          left: true, right: true, bottom: true, top: true,
        },
        modifiers: [
          interact.modifiers.restrict({
            restriction: 'parent',
          }),
          preserveRatio,
        ],
        listeners: {
          start: startHandler,
          move: resizeHandler,
          end: resizeEnd,
        },
      })

    interact(mover.current)
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
          interact(base.current), // target Interactable
          base.current,
        ) // target Element
      })
  }

  const base = useRef()
  const frame = useRef()
  const captionRef = useRef()
  const mover = useRef()
  const posRef = useRef(null)
  const startPos = useRef(null)
  const models = useRef([])

  useEffect(() => {
    models.current = modules
    const points = _.flatten(modules.map(m => getRotatedPoints(m.props.position, m.props.position.rotation)))
    const left = _.minBy(points, 'x')?.x
    const top = _.minBy(points, 'y')?.y
    const right = _.maxBy(points, 'x')?.x
    const bottom = _.maxBy(points, 'y')?.y

    posRef.current = {
      left, top, width: right - left, height: bottom - top,
    }
    forceUpdate()
  }, [selectedIds, modules])
  useEffect(() => {
    if (!base.current) { return }

    applyInteract()
  }, [base.current])

  if (!selectedIds.length || pageId !== selectedPageId) { return null }

  const startHandler = (event) => {
    event.stopPropagation()
    frame.current.style.background = '#00d0ff99'
    startPos.current = { ...posRef.current }
  }

  const dragHandler = (event) => {
    event.stopPropagation()

    const pos = posRef.current
    const $target = $(event.target)
    let x = pos.left + event.dx
    let y = pos.top + event.dy
    if (x < 0) x = 0
    if (y < 0) y = 0
    $target.css({ transform: `translate(${x}px, ${y}px)` })
    pos.left = x
    pos.top = y

    captionRef.current.innerText = getCaption(pos)
  }

  const dragEnd = (event) => {
    event.stopPropagation()
    frame.current.style.background = ''

    const pos = posRef.current
    const newX = pos.left - startPos.current.left
    const newY = pos.top - startPos.current.top

    models.current.forEach((module) => {
      module.props.position.left += Math.round(newX)
      module.props.position.top += Math.round(newY)
      module.update()
    })
  }

  const resizeHandler = (event) => {
    const $target = $(event.target)
    const pos = posRef.current
    if (event.shiftKey) {
      preserveRatio.enable()
    } else {
      preserveRatio.disable()
    }
    let x = pos.left
    let y = pos.top
    let width = event.rect.width - 1
    let height = event.rect.height - 1
    $target.css({ width: `${width}px`, height: `${height}px` })

    x += event.deltaRect.left
    y += event.deltaRect.top
    if (x < 0) x = 0
    if (y < 0) y = 0
    // eslint-disable-next-line prefer-destructuring
    if (width > pageSize.width) width = pageSize.width
    // eslint-disable-next-line prefer-destructuring
    if (height > pageSize.height) height = pageSize.height
    $target.css({ transform: `translate(${x}px, ${y}px)` })

    pos.left = x
    pos.top = y
    pos.width = width
    pos.height = height
    captionRef.current.innerText = getCaption(pos)
  }


  const resizeEnd = (event) => {
    event.stopPropagation()
    const pos = posRef.current
    const start = startPos.current

    const dWidth = pos.width / start.width
    const dHeight = pos.height / start.height
    frame.current.style.background = ''
    models.current.forEach((module) => {
      const dx = (module.props.position.left - start.left) * dWidth
      const dy = (module.props.position.top - start.top) * dHeight
      const dw = module.props.position.width * dWidth
      const dh = module.props.position.height * dHeight
      module.props.position.left = Math.round(pos.left + dx)
      module.props.position.top = Math.round(pos.top + dy)
      module.props.position.width = Math.round(dw)
      module.props.position.height = Math.round(dh)
      module.update()
    })
  }

  const pos = posRef.current
  if (currentPage.id !== pageId) { return null }
  if (!modules.length || !pos) { return null }

  // if (module.meta.hidden) { return null }

  const style = {
    width: pos.width,
    height: pos.height,
    zIndex: 9999,
  }

  style.transform = `translate(${pos.left}px,${pos.top}px)`
  const className = cs(styles.base,
    {
      [styles.editor]: true,
      [styles.selected]: true,
    }, 'fe-module-container')


  const getCaption = pos => `x:${Math.round(pos.left)} y:${Math.round(pos.top)}`
    + ` size:${Math.round(pos.width)}x${Math.round(pos.height)}`
  return (
    <>
      <div
        ref={base}
        className={className}
        style={style}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.crop}>
          <div className={cs(styles.corner, styles.topleftcorner)} />
          <div className={cs(styles.corner, styles.toprightcorner)} />
          <div className={cs(styles.corner, styles.bottomrightcorner)} />
          <div className={cs(styles.corner, styles.bottomleftcorner)} />
        </div>
        <div className={cs(styles.sizeBox, { [styles.bottom]: pos.top < 0 })} ref={mover}>
          <i
            className={`fa fa-arrows ${styles.mover}`}
            data-right="true"
            data-bottom="true"
          />
          <div className={styles.label} ref={captionRef}>
            {getCaption(pos)}
          </div>
        </div>
        <div ref={frame} className={`${styles.frame} fe-module-frame-container`} />
      </div>
      <div className={styles.backdrop} onClick={e => e.stopPropagation()} />
    </>
  )
}

export default FoundationSelected
