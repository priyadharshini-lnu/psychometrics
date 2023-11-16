import { useEffect, useRef, useState } from 'react'
import {
  Modal, Row, Col, Button,
} from 'antd'
import { FixedCropperRef, FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import 'react-advanced-cropper/dist/style.css'

export function CropImageModal ({
  show, onCrop, onCancel, image,
}) {
  const cropperRef = useRef<FixedCropperRef>(null)
  const [loading, setLoading] = useState(false)
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

  return (
    <Modal
      centered
      closable={false}
      open={show}
      onOk={() => cropImage()}
      confirmLoading={loading}
      maskClosable={!loading}
      cancelButtonProps={{ loading }}
      onCancel={() => onCancel()}
      width={1000}
    >
      <FixedCropper
        style={{ height: 500 }}
        stencilSize={{
          width: 400,
          height: 400,
        }}
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
      <Row>
        <Col style={{ padding: 4 }}>
          <Button
            ghost
            onClick={() => cropperRef.current?.zoomImage(0.9)}
          >
            <ZoomOutOutlined />
          </Button>
        </Col>
        <Col style={{ padding: 4 }}>
          <Button
            ghost
            onClick={() => cropperRef.current?.zoomImage(1.1)}
          >
            <ZoomInOutlined />
          </Button>
        </Col>
      </Row>
    </Modal>

  )
}
