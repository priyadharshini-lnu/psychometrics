import React, {
  useState, useEffect, useRef, PropsWithChildren,
} from 'react'
import _ from 'lodash'
import {
  Button, Modal, Space, Input, InputNumber, Popconfirm, Switch,
} from 'antd'
import {
  SortableContainer, SortableContainerProps, SortableElement, SortableElementProps, SortableHandle,
} from 'react-sortable-hoc'
import { arrayMove } from '@dnd-kit/sortable'
import { MenuOutlined, DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ColorPicker } from '~/glint'
import styles from './BlockSettingsModal.less'
import LabelEditor from '~/modules/survey/components/LabelEditor'
import utils from '~/modules/survey/utils'
import Socket from '~/modules/survey/cable'
import LibraryTransport from '~/modules/survey/cable/LibraryChannel'
import { LibraryStore } from '~/libs/library'

const { I18n } = window

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />)

type SortableItemType = React.ComponentClass<PropsWithChildren<SortableElementProps & { className: string }>>
const SortableItem: SortableItemType = SortableElement(props => (
  <div {...props} />
))
const SortableBody: React.ComponentClass<PropsWithChildren<SortableContainerProps>> = SortableContainer(props => (
  <div {...props} />
))

const defaultBackground = {
  mainColor: '#ffffff',
  enabled: false,
  baseOffset: 1,
  layers: [],
}

interface Layer {
  id: string
  name: string
  image: string | null
  color: string | null
  speed: number | undefined
}

interface State {
  mainColor: string
  enabled: boolean
  baseOffset: number
  layers: Layer[]
}

export const BlockSettingsModal = ({ model, close, updateBlockProps }) => {
  const [state, setState] = useState<State>({ ...(model.props.background || defaultBackground) })

  const librarySocket = useRef<ReturnType<typeof Socket.library> | null>(null)

  useEffect(() => {
    LibraryTransport.init()
    librarySocket.current = Socket.library()
  }, [])

  const save = () => {
    updateBlockProps(model, { background: state })
    close()
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove<Layer>(state.layers.slice(), oldIndex, newIndex).filter(
        el => !!el,
      )
      setState({ ...state, layers: newData })
    }
  }

  const addLayer = () => {
    const layer = {
      id: utils.genId(),
      name: utils.findName('Layer', state.layers),
      image: null,
      color: null,
      speed: 1,
    }
    setState({ ...state, layers: [...state.layers, layer] })
  }

  const changeLayerColor = (layer, v) => {
    setState({
      ...state,
      layers: state.layers.map(l => (l.id === layer.id ? { ...l, color: v } : l)),
    })
  }

  const changeLayerName = (layer, v) => {
    setState({
      ...state,
      layers: state.layers.map(l => (l.id === layer.id ? { ...l, name: v } : l)),
    })
  }

  const changeLayerImage = (layer, value) => {
    setState({
      ...state,
      layers: state.layers.map(l => (l.id === layer.id ? { ...l, image: value } : l)),
    })
  }

  const changeLayerSpeed = (layer, v) => {
    setState({
      ...state,
      layers: state.layers.map(l => (l.id === layer.id ? { ...l, speed: v } : l)),
    })
  }

  const removeLayer = (layer) => {
    setState({
      ...state,
      layers: state.layers.filter(l => l.id !== layer.id),
    })
  }

  const openLibrary = (layer) => {
    LibraryStore.openPopup(
      librarySocket.current,
      item => handleImageSelect(layer, item),
      'image',
    )
  }

  const handleImageSelect = (layer, item) => {
    if (item && item.file) {
      changeLayerImage(layer, item.file)
    }
  }

  const changeMainColor = (val) => {
    setState({ ...state, mainColor: val })
  }

  return (
    <Modal
      width="70%"
      title={I18n.t('administration.block_settings.modal.title')}
      open
      mask={{ closable: false }}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={save}>
          {I18n.t('common.actions.save')}
        </Button>,
      ]}
    >
      <div>
        <div className={styles.generalSettings}>
          <Space orientation="vertical">
            <div>
              <Space>
                <Switch
                  checked={state.enabled}
                  onChange={() => setState({ ...state, enabled: !state.enabled })}
                />
                {' '}
                Enabled
              </Space>
            </div>
            <div>
              <Space>
                <div className={styles.label}>
                  {I18n.t('administration.block_settings.modal.main_background_color')}
                </div>
                <ColorPicker
                  getValueInHexFormat
                  defaultColor="#ffffff"
                  value={state.mainColor}
                  onChange={v => changeMainColor(v)}
                />
              </Space>
            </div>
            <div>
              <Space>
                <div className={styles.label}>
                  {I18n.t('administration.block_settings.modal.base_offse_speed')}
                </div>
                <InputNumber
                  value={state.baseOffset}
                  min={1}
                  max={100}
                  onChange={val => setState({ ...state, baseOffset: val ? +val : 1 })}
                />
              </Space>
            </div>
          </Space>
        </div>
        <hr />
        <div className={styles.label}>
          {I18n.t('administration.block_settings.modal.layers')}
        </div>
        <SortableBody
          useDragHandle
          disableAutoscroll
          lockAxis="y"
          helperClass="row-dragging"
          onSortEnd={onSortEnd}
        >
          {_.map(state.layers, (layer, index) => (
            <SortableItem key={layer.id} index={index} className={styles.layer}>
              <Space orientation="vertical">
                <Space>
                  <DragHandle />
                  <LabelEditor value={layer.name} onChange={v => changeLayerName(layer, v)} />
                  <Popconfirm
                    title={I18n.t('administration.block_settings.modal.confirm_title')}
                    description={I18n.t('administration.block_settings.modal.confirm_msg')}
                    onConfirm={() => removeLayer(layer)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </Space>
                <div>
                  <Space>
                    <div className={styles.label}>
                      {I18n.t('administration.block_settings.modal.background_image')}
                    </div>
                    <Input
                      className={styles.input}
                      value={layer.image || ''}
                      onChange={({ target: { value } }) => changeLayerImage(layer, value)}
                      allowClear
                    />
                    <Button type="link" onClick={() => openLibrary(layer)}>
                      {I18n.t('administration.block_settings.modal.select_from_lib')}
                    </Button>
                  </Space>
                </div>
                <div>
                  <Space>
                    <div className={styles.label}>
                      {I18n.t('administration.block_settings.modal.background_color')}
                    </div>
                    <ColorPicker
                      getValueInHexFormat
                      defaultColor="#ffffff"
                      value={layer.color || ''}
                      onChange={v => changeLayerColor(layer, v)}
                    />
                  </Space>
                  <Button type="link" danger onClick={() => changeLayerColor(layer, null)}>
                    <DeleteOutlined />
                  </Button>
                </div>
                <div>
                  <Space>
                    <div className={styles.label}>
                      {I18n.t('administration.block_settings.modal.speed')}
                    </div>
                    <InputNumber
                      value={typeof layer.speed === 'undefined' ? '' : layer.speed}
                      onChange={value => changeLayerSpeed(layer, value)}
                    />
                  </Space>
                </div>
              </Space>
            </SortableItem>
          ))}
        </SortableBody>
        <Button onClick={addLayer}>
          {I18n.t('administration.block_settings.modal.add_layer')}
        </Button>
      </div>
    </Modal>
  )
}

export default BlockSettingsModal
