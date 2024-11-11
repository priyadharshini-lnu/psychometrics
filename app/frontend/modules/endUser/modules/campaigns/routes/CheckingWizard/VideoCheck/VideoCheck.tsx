import _ from 'lodash'
import React, {
  useReducer, useRef, useEffect, useState,
} from 'react'
import {
  Button, Card, Col, Space,
} from 'antd'
import { CheckOutlined, RightOutlined, RedoOutlined } from '@ant-design/icons'
import { DirectUpload } from '@rails/activestorage'
import axios from 'axios'
import * as faceapi from 'face-api.js'
import { BROWSER_NAME } from '~/utils/uaParser'
import { InitVideo } from './InitVideo'
import { Progress } from '../Progress'
import { CheckList } from '../CheckList'
import reducer, {
  initialState, updateAccess, updateFaceDetection, failFaceDetectionByTimeout, updateUploading,
} from './reducer'
import { CheckListStatus } from '../interfaces'
import styles from './styles.less'

const { I18n, $ } = window

interface Props {
  nextStep: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let player: any = null

export const VideoCheck: React.FC<Props> = ({ nextStep }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, dispatch] = useReducer(reducer, initialState)
  const [img, setImg] = useState<Blob | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    player = InitVideo.run(videoRef.current)
    player.on('error', () => {
      dispatch(updateAccess(CheckListStatus.Failed))
    })
    faceapi.nets.tinyFaceDetector.loadFromUri('/face-api/models')
    player.on('deviceReady', () => {
      player.record().start()
    })
    player.on('startRecord', () => {
      setTimeout(() => track(), 1000)
    })
    player.on('finishRecord', () => dispatch(failFaceDetectionByTimeout()))
  }, [])

  const requestAccess = async () => {
    if (!videoRef.current) return

    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      dispatch(updateAccess(CheckListStatus.Done))
      player.record().getDevice()
    } catch (e) {
      dispatch(updateAccess(CheckListStatus.Failed))
    }
  }

  const track = async () => {
    if (!videoRef.current) return
    const options = new faceapi.TinyFaceDetectorOptions()

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    // draw the video at that frame
    const ctx = canvas.getContext('2d')
    ctx?.translate(canvas.width, 0)
    ctx?.scale(-1, 1)
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      const detections = await faceapi.detectSingleFace(canvas, options)

      if (detections) {
        player.record().pause()
        setImg(blob)
        dispatch(updateFaceDetection(CheckListStatus.Done))
      } else {
        setTimeout(() => track(), 500)
      }
    }, 'image/jpeg', 0.95)
  }

  const imageUpload = async () => {
    const upload = new DirectUpload(
      img,
      `${location.pathname}/upload_user_verification_image_url`,
      {
        directUploadWillStoreFileWithXHR: (xhr: XMLHttpRequest) => {
          xhr.upload.addEventListener('progress', () => {
            dispatch(updateUploading(CheckListStatus.InProgress))
          })
        },
      },
    )

    upload.create((error, blob) => {
      if (error) {
        dispatch(updateUploading(CheckListStatus.Failed))
      } else {
        onUploadDone(blob)
      }
    })

    dispatch(updateUploading(CheckListStatus.InProgress))
  }

  const onUploadDone = (blob) => {
    axios.put(`${location.pathname}/user_verification_image_upload_callback`, {
      media_id: blob.media_id,
      asset_key: blob.signed_id,
    }, {
      headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    }).then(() => {
      dispatch(updateUploading(CheckListStatus.Done))
      nextStep()
    }).catch(() => {
      dispatch(updateUploading(CheckListStatus.Failed))
    })
  }

  const rerun = async () => {
    setImg(null)
    dispatch(updateUploading(CheckListStatus.Pending))
    // await requestAccess()
    if (state.access === CheckListStatus.Failed) return
    player.record().resume()
    dispatch(updateFaceDetection(CheckListStatus.InProgress))
    track()
  }
  let progress = 0
  if (state.access === CheckListStatus.Done) progress += 33
  if (state.faceDetection === CheckListStatus.Done) progress += 33
  if (state.uploading === CheckListStatus.Done) progress += 34


  return (
    <>
      <title>{`${I18n.t('checking_wizard.video_check.title')}`}</title>
      <Col className={styles.container} lg={16} xs={24} sm={24}>
        <Card className={styles.card}>
          <h4>{I18n.t('checking_wizard.video_check.title')}</h4>
          <p>{I18n.t('checking_wizard.video_check.description')}</p>
          <div className="position-relative">
            <video ref={videoRef} className={styles.video} />
            {_.includes([CheckListStatus.InProgress, CheckListStatus.Failed], state.access) && (
            <div className={styles.videoOverlap}>
              <div className={styles.iconContainer}>
                <span className={styles.icon} />
              </div>
              <div className={styles.allowTitle}>
                {I18n.t('checking_wizard.video_check.allow_title')}
              </div>
              {state.access === CheckListStatus.InProgress && (
              <Button type="primary" onClick={requestAccess}>
                <CheckOutlined />
                {I18n.t('checking_wizard.video_check.allow')}
              </Button>
              )}
              {state.access === CheckListStatus.Failed && (
              <Button type="primary" size="middle">
                <a
                  href={`https://www.google.com/search?q=allow+camera+and+microphone+access+on+${BROWSER_NAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('checking_wizard.video_check.access_help')}
                </a>
              </Button>
              )}
            </div>
            )}
          </div>
        </Card>
      </Col>
      <Col className={styles.container} lg={8} xs={24} sm={24}>
        <Card className={styles.card}>
          <Progress percent={progress} title={I18n.t('checking_wizard.video_check.processing')} />
          <CheckList
            className="mt24"
            dataSource={[
              { name: I18n.t('checking_wizard.video_check.access'), status: state.access },
              { name: I18n.t('checking_wizard.video_check.face_detection'), status: state.faceDetection },
              { name: I18n.t('checking_wizard.video_check.uploading'), status: state.uploading },
            ]}
          />
          {img && (
          <div className={styles.faceContainer}>
            <img src={URL.createObjectURL(img)} alt="face" className={styles.face} />
            <div className={styles.hint}>{I18n.t('checking_wizard.video_check.hint')}</div>
          </div>
          )}
          {state.access !== CheckListStatus.Failed && state.faceDetection !== CheckListStatus.Failed ? (
            <Space>
              {state.access === CheckListStatus.Done
                && (
                  <Button
                    className={styles.continueButton}
                    onClick={rerun}
                    icon={<RedoOutlined />}
                    disabled={state.uploading === CheckListStatus.InProgress
                      || state.uploading === CheckListStatus.Done}
                  >
                    {I18n.t('checking_wizard.video_check.retake')}
                  </Button>
                )}
              <Button
                size="middle"
                type="primary"
                className={styles.continueButton}
                onClick={imageUpload}
                disabled={state.access !== CheckListStatus.Done || state.faceDetection !== CheckListStatus.Done}
                loading={state.uploading === CheckListStatus.InProgress}
              >
                {I18n.t('checking_wizard.video_check.continue')}
                <RightOutlined />
              </Button>
            </Space>
          )
            : (
              <Button
                type="primary"
                className={styles.continueButton}
                onClick={rerun}
              >
                {I18n.t('checking_wizard.video_check.run_again')}
                <RightOutlined />
              </Button>
            )
          }
        </Card>
      </Col>
    </>
  )
}

export default VideoCheck
