import React, { useEffect, useRef, useState } from 'react'
import { Modal } from 'antd'
import { FixedCropperRef, FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'

export function CropperModal ({
  show, onCrop, onCancel, image,
}) {
  const cropperRef = useRef<FixedCropperRef>(null)
  const [loading, setLoading] = useState(false)
  const cropImage = () => {
    setLoading(true)
    onCrop(cropperRef.current?.getCanvas())
  }

  useEffect(() => {
    setLoading(false)
  }, [show])

  return (
    <Modal
      centered
      closable={false}
      visible={show}
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
    </Modal>

  )
}
