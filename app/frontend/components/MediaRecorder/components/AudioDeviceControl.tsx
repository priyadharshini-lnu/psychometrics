import React, { useState } from 'react'
import { Button, Popover, Flex } from 'antd'
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

  const popoverContent = (
    <div className={styles.devicePopover}>
      <div className={styles.devicePopoverTitle}>{I18n.t('shared.select_microphone')}</div>
      <Flex gap={4} vertical>
        {audioDevices.map(device => (
          <Flex
            key={device.deviceId}
            className={`${styles.deviceOption} ${
              selectedMicId === device.deviceId ? styles.deviceOptionSelected : ''
            }`}
            onClick={() => { onChangeMic(device.deviceId); setOpen(false) }}
          >
            <span className={styles.deviceCheckmark}>
              {selectedMicId === device.deviceId ? '✓' : ''}
            </span>
            <span className={styles.deviceOptionLabel}>
              {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
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
              <AudioOutlined style={{ fontSize: '1.2rem' }} />
              <DownOutlined style={{ fontSize: '0.75rem' }} />
            </div>

          </Button>
        </Popover>
      </div>
    </div>
  )
}

export default AudioDeviceControl
