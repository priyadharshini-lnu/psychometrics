import cs from 'classnames'
import { useSelector, useDispatch } from 'react-redux'
import styles from './Foundation.less'
import RichEditorStore from '~/modules/reports/store/RichEditorStore'
import { actions } from '~/modules/reports/core/temp/selection'


const Foundation = ({
  module, shadow, preview, outerStyle, children, error, closeRichEditor, pageSize, flipContent,
}) => {
  const selectedIds = useSelector(state => state.report.ui.selection.selected)
  const dispatch = useDispatch()
  const isSelected = selectedIds.includes(module.id)
  const lang = new URLSearchParams(window.location.search).get('lang') || 'en'
  const isRTL = ['ar', 'he'].includes(lang)

  const select = (e) => {
    if (preview) { return }
    e.stopPropagation()
    if (module.meta.locked) { return }

    const select = () => {
      dispatch(actions.toggle({ moduleId: module.id, pageId: module.page_id }))
    }

    closeRichEditor()
    RichEditorStore.close()
    if (selectedIds.length > 0 && e.shiftKey) {
      return select()
    }

    dispatch(actions.selectSignle({ moduleId: module.id, pageId: module.page_id }))
  }

  const forceSelect = (e) => {
    if (module.meta.locked) {
      e.stopPropagation()
      dispatch(actions.selectSignle({ moduleId: module.id, pageId: module.page_id }))
    }
  }

  const mprops = module.props

  if (module.meta.hidden) { return null }
  const {
    left, top, width, height, rotation = 0,
  } = mprops.position

  const style = {
    width,
    height,
    zIndex: mprops.zIndex,
  }

  style.transform = flipContent
    ? `translate(${pageSize.width - left - width}px,${top}px) rotate(${-(rotation || 0)}deg)`
    : `translate(${left}px,${top}px) rotate(${rotation || 0}deg)`

  const className = cs(styles.base,
    {
      [styles.editor]: !preview,
      [styles.shadow]: shadow && !preview,
      [styles.selected]: isSelected,
      [styles.locked]: module.meta.locked,
      [styles.error]: error,
      rtl: isRTL,
    }, 'fe-module-container')

  return (
    <div
      name={shadow ? '' : `Module_${module.id}`}
      className={className}
      style={style}
      onClick={select}
      onDoubleClick={forceSelect}
    >
      <div className={styles.sizeBox} />
      <div className={cs(styles.frame)} style={outerStyle}>
        {children}
      </div>
    </div>
  )
}

export default Foundation
