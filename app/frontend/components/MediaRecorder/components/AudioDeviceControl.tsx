import React, { useState, useEffect, useRef } from 'react'
import {
  Button, Popover, Select, RefSelectProps,
} from 'antd'
import styles from '../styles.less'
import { AudioOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface AudioDeviceControlProps {
  audioDevices: MediaDeviceInfo[];
  selectedMicId?: string;
  onChangeMic: (deviceId: string) => void;
  disabled?: boolean;
}

const AudioDeviceControl: React.FC<AudioDeviceControlProps> = ({
  audioDevices,
  selectedMicId,
  onChangeMic,
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
      <div className={styles.devicePopoverTitle}>{I18n.t('shared.select_microphone')}</div>
      <Select
        value={selectedMicId}
        onChange={(value) => { onChangeMic(value); setOpen(false) }}
        style={{ width: '100%' }}
        ref={selectRef}
        placement="topRight"
      >
        {audioDevices.map(device => (
          <Select.Option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
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
            aria-label={I18n.t('enduser.select_audio_device')}
          >
            <div className={styles.deviceControlMain}>
              <AudioOutlined aria-hidden="true" style={{ fontSize: '1.2rem' }} />
              <DownOutlined aria-hidden="true" style={{ fontSize: '0.75rem' }} />
            </div>

          </Button>
        </Popover>
      </div>
    </div>
  )
}

export default AudioDeviceControl
