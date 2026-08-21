import { useEffect, useRef, useState } from 'react'
import {
  Modal, Row, Col, Button, Slider, Space,
} from 'antd'
import {
  FixedCropperRef, FixedCropper, ImageRestriction,
} from 'react-advanced-cropper'
import { getAbsoluteZoom, getZoomFactor } from 'advanced-cropper/extensions/absolute-zoom'

import {
  MinusOutlined, PlusOutlined, UndoOutlined, RedoOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import 'react-advanced-cropper/dist/style.css'

export function CropImageModal ({
  show, onCrop, onCancel, image, showControls = false,
}) {
  const cropperRef = useRef<FixedCropperRef>(null)
  const [loading, setLoading] = useState(false)
  const [scale, setScale] = useState(0.5)
  const [rotate, setRotate] = useState(0)
  const cropImage = () => {
    setLoading(true)
    onCrop(cropperRef.current?.getCanvas({
      minHeight: 0,
      minWidth: 0,
      maxHeight: 1000,
      maxWidth: 1000,
    }))
  }

  useEffect(() => {
    setLoading(false)
  }, [show])

  const changeScale = (value) => {
    value = Math.max(0, value)
    value = Math.min(1, value)
    const cropper = cropperRef.current
    if (cropper) {
      cropper.zoomImage(
        getZoomFactor(cropper.getState(), cropper.getSettings(), value),
        {
          transitions: false,
        },
      )
      setScale(value)
    }
  }

  const changeRotate = (value) => {
    const state = cropperRef.current?.getState()
    setRotate(value)
    if (state) {
      const angle = value - rotate

      if (state.coordinates) {
        cropperRef.current?.rotateImage({
          angle,
          center: {
            left: state.coordinates.left + state.coordinates.width / 2,
            top: state.coordinates.top + state.coordinates.height / 2,
          },
        }, { immediately: true, transitions: false })
      }
    }
  }

  const onTransform = (cropper) => {
    if (!cropper.hasInteractions()) { return }

    const state = cropper.getState()
    const settings = cropper.getSettings()
    const absoluteZoom = getAbsoluteZoom(state, settings)
    setScale(absoluteZoom)
  }

  return (
    <Modal
      centered
      closable={false}
      open={show}
      onOk={() => cropImage()}
      confirmLoading={loading}
      mask={{ closable: !loading }}
      cancelButtonProps={{ disabled: loading }}
      onCancel={() => {
        setScale(0.5)
        setRotate(0)
        onCancel()
      }}
      width={1000}
    >
      <FixedCropper
        style={{ height: 500 }}
        stencilSize={{
          width: 400,
          height: 400,
        }}
        onTransformImage={onTransform}
        stencilProps={{
          handlers: false,
          lines: false,
          movable: false,
          resizable: false,
        }}
        ref={cropperRef}
        src={image && image.src}
        imageRestriction={ImageRestriction.stencil}
      />
      {showControls && (
        <Row justify="center">
          <Col>
            <Space orientation="vertical">
              <Space.Compact>
                <Button type="link" icon={<MinusOutlined />} onClick={() => changeScale(scale - 0.1)} />
                <Slider style={{ width: 250 }} value={scale} min={0} onChange={changeScale} step={0.01} max={1} />
                <Button type="link" icon={<PlusOutlined />} onClick={() => changeScale(scale + 0.1)} />
              </Space.Compact>
              <Space.Compact>
                <Button type="link" icon={<UndoOutlined />} onClick={() => changeRotate(rotate - 5)} />
                <Slider style={{ width: 250 }} value={rotate} min={-180} max={180} onChange={changeRotate} />
                <Button type="link" icon={<RedoOutlined />} onClick={() => changeRotate(rotate + 5)} />
              </Space.Compact>
            </Space>
          </Col>
        </Row>
      )}
    </Modal>

  )
}
