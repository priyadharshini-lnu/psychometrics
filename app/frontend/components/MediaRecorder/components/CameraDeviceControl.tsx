import React, { useState } from 'react'
import { Button, Popover, Flex } from 'antd'
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

  const popoverContent = (
    <div className={styles.devicePopover}>
      <div className={styles.devicePopoverTitle}>{I18n.t('shared.select_camera')}</div>
      <Flex gap={4} vertical>
        {videoDevices.map(device => (
          <Flex
            key={device.deviceId}
            className={`${styles.deviceOption} ${
              selectedCameraId === device.deviceId ? styles.deviceOptionSelected : ''
            }`}
            onClick={() => { onChangeCamera(device.deviceId); setOpen(false) }}
          >
            <span className={styles.deviceCheckmark}>
              {selectedCameraId === device.deviceId ? '✓' : ''}
            </span>
            <span className={styles.deviceOptionLabel}>
              {device.label || `${I18n.t('shared.camera')} ${device.deviceId.slice(0, 8)}`}
            </span>
          </Flex>

        ))}
      </Flex>
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
          placement="topLeft"
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
              <VideoCameraOutlined style={{ fontSize: '1.2rem' }} />
              <DownOutlined style={{ fontSize: '0.75rem' }} />
            </div>

          </Button>
        </Popover>
      </div>
    </div>
  )
}

export default CameraDeviceControl
