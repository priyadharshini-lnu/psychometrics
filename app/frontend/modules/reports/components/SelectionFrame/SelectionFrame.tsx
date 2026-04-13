
import { connect, useDispatch } from 'react-redux'
import {
  useEffect, useRef,
} from 'react'
import { RootState } from 'modules/reports/core/rootReducers'
import styles from './SelectionFrame.less'
import { getModules, getCurrentPage } from '~/modules/reports/core/builder/selectors'
import { actions } from '~/modules/reports/core/temp/selection'
import RichEditorStore from '~/modules/reports/store/RichEditorStore'

const connector = connect((state:RootState) => ({
  report: state.report,
  page: getCurrentPage(state.report),
}), {})

const checkIntersection = (a, b) => {
  if (!a || !b) { return false }

  const aRight = a.left + a.width
  const aBottom = a.top + a.height
  const bRight = b.left + b.width
  const bBottom = b.top + b.height

  return (
    a.left < bRight && aRight > b.left && a.top < bBottom && aBottom > b.top
  )
}

const SelectionFrame = ({ report, page, children }) => {
  const dispatch = useDispatch()
  const frame = useRef<HTMLDivElement>(null)
  const down = useRef(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const boxRef = useRef({
    left: 0, top: 0, width: 0, height: 0,
  })

  const modules = getModules(report, page?.modules ?? [])
    .filter(module => !module.removed && !module.meta.locked && !module.meta.hidden)
  const modulesRef = useRef(modules)
  const pageRef = useRef(page)

  useEffect(() => {
    modulesRef.current = modules
    pageRef.current = page
  }, [page, modules])

  useEffect(() => {
    const mouseup = (e) => {
      if (!down.current) { return }

      down.current = false
      if (frame.current) {
        frame.current.style.width = '0'
        frame.current.style.height = '0'
        frame.current.style.display = 'none'
      }

      const modulesToSelect = modulesRef.current.filter(module => checkIntersection(
        boxRef.current,
        document.querySelector(`[name="Module_${module.id}"]`)?.getBoundingClientRect(),
      )).map(module => module.id)

      if (e.shiftKey) {
        dispatch(actions.addMultiple({ moduleIds: modulesToSelect, pageId: pageRef.current.id }))
      } else {
        dispatch(actions.selectMultiple({ moduleIds: modulesToSelect, pageId: pageRef.current.id }))
      }
    }

    const mousemove = (e) => {
      if (!down.current) { return }
      const box = boxRef.current
      const start = startPoint.current

      const x = e.clientX
      const y = e.clientY
      const width = x - box.left
      const height = y - box.top
      box.width = width
      box.height = height

      if (x < start.x) {
        box.width = start.x - x
        box.left = x
      }

      if (y < start.y) {
        box.height = start.y - y
        box.top = y
      }
      if (!frame.current) { return }
      frame.current.style.transform = `translate(${box.left}px, ${box.top}px)`
      frame.current.style.width = `${box.width}px`
      frame.current.style.height = `${box.height}px`
    }

    document.addEventListener('mouseup', mouseup)
    document.addEventListener('mousemove', mousemove)

    return () => {
      document.removeEventListener('mouseup', mouseup)
      document.removeEventListener('mousemove', mousemove)
    }
  }, [])

  if (!page) { return null }

  const mousedown = (e) => {
    boxRef.current = {
      left: e.clientX, top: e.clientY, width: 0, height: 0,
    }
    startPoint.current = { x: e.clientX, y: e.clientY }
    down.current = true
    if (frame.current) {
      frame.current.style.display = 'block'
    }

    if (!e.shiftKey) {
      dispatch(actions.unselectAll())
    }
    RichEditorStore.close()
  }

  return (
    <>
      <div className={styles.selectionWrapper}>
        {children}
        <div className={styles.frame} ref={frame} />
      </div>
      <div className={styles.backdrop} onMouseDown={mousedown} />
    </>
  )
}

export default connector(SelectionFrame)
