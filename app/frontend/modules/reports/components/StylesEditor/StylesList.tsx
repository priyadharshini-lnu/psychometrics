import _ from 'lodash'
import {
  Button, Popover, Popconfirm,
} from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { useState } from 'react'
import styles from './StylesList.less'
import Utils from '~/modules/reports/utils'

import { addStyle, updateStyle, removeStyle } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'
import { Style } from '~/modules/reports/core/interfaces/Report'
import StylesEditor from './StylesEditor'

const DEFAULT_STYLES = {}

const connector = connect(
  ({ report: { builder } }: RootState) => ({
    list: builder.styles,
  }),
  {
    addStyle, updateStyle, removeStyle,
  },
)

export const StylesList = ({
  list, addStyle, updateStyle, removeStyle,
}) => {
  const [style, showEditor] = useState<Style | null>(null)
  const newStyle = () => {
    addStyle({
      id: Utils.genId(),
      styles: { ...DEFAULT_STYLES },
      name: 'New Style',
    })
  }

  const onSave = (style) => {
    updateStyle(style)
    showEditor(null)
  }

  const onDelete = (style) => {
    removeStyle(style)
  }

  return (
    <div className={styles.main}>
      {style
        ? <StylesEditor style={style} onSave={onSave} onCancel={() => showEditor(null)} />
        : (
          <>
            {_.size(list) > 0 ? _.map(list, (item, id) => (
              <div className={styles.item} key={id}>
                <Popover
                  placement="left"
                  trigger={['hover']}
                  content={<div style={{ ...item.styles }}>Sample Text</div>}
                >
                  <div className={styles.name}>{item.name}</div>
                </Popover>
                <div className={styles.icons}>
                  <Button type="link" icon={<EditOutlined />} onClick={() => showEditor(item)} />
                  <Popconfirm
                    zIndex={9999}
                    title="Delete the style"
                    description="Are you sure to delete this style?"
                    onConfirm={() => onDelete(item)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            ))
              : <div>Click add to create a new style</div>
            }
            <hr className={styles.divider} />
            <div className="ta-e">
              <Button type="primary" icon={<PlusOutlined />} onClick={newStyle}>Add</Button>
            </div>
          </>
        )
      }
    </div>
  )
}

export default connector(StylesList)
