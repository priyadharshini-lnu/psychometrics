import React, {
  useEffect, useState, useRef,
} from 'react'
import {
  Button, Popover, Select, RefSelectProps,
} from 'antd'
import styles from '../styles.less'
import { VideoCameraOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface CameraDeviceControlProps {
  videoDevices: MediaDeviceInfo[];
  selectedCameraId?: string;
  onChangeCamera: (deviceId: string) => void;
  disabled?: boolean;
}

const CameraDeviceControl: React.FC<CameraDeviceControlProps> = ({
  videoDevices,
  selectedCameraId,
  onChangeCamera,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)

  const selectRef = useRef<RefSelectProps>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        selectRef.current?.focus()
      }, 100)
    }
  }, [open])

  const popoverContent = (
    <div className={styles.devicePopover}>
      <div className={styles.devicePopoverTitle}>{I18n.t('shared.select_camera')}</div>
      <Select
        value={selectedCameraId}
        onChange={(value) => { onChangeCamera(value); setOpen(false) }}
        style={{ width: '100%' }}
        ref={selectRef}
        placement="topRight"
      >
        {videoDevices.map(device => (
          <Select.Option key={device.deviceId} value={device.deviceId}>
            {device.label || `${I18n.t('shared.camera')} ${device.deviceId.slice(0, 8)}`}
          </Select.Option>
        ))}
      </Select>
    </div>
  )

  return (
    <div className={styles.deviceControlWrapper}>
      <div className={styles.deviceControlButton}>
        <Popover
          content={popoverContent}
          trigger="click"
          open={open}
          onOpenChange={setOpen}
          placement="topRight"
          overlayClassName={styles.devicePopoverOverlay}
          styles={{
            container: {
              maxWidth: '260px',
            },
          }}
        >
          <Button
            className={styles.deviceControlChevron}
            disabled={disabled}
            aria-label={I18n.t('shared.select_camera')}
          >
            <div className={styles.deviceControlMain}>
              <VideoCameraOutlined aria-hidden="true" style={{ fontSize: '1.2rem' }} />
              <DownOutlined aria-hidden="true" style={{ fontSize: '0.75rem' }} />
            </div>

          </Button>
        </Popover>
      </div>
    </div>
  )
}

export default CameraDeviceControl
