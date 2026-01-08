import React, { useState, useRef, useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Tabs } from 'antd'
import { AudioOutlined, VideoCameraOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { TabPane } = Tabs

const AUDIO = 'audio'
const VIDEO = 'video'
const URL_TYPE = { AUDIO, VIDEO }

interface Props { editor: any } /* eslint-disable-line @typescript-eslint/no-explicit-any */

const EmbedMediaComponent: React.FC<Props> = ({ editor }) => {
  const [currentTab, setCurrentTab] = useState(URL_TYPE.AUDIO)
  const [_, setUrl] = useState<string | null>(null) /* eslint-disable-line @typescript-eslint/no-unused-vars */
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    editor.popups.onRefresh('embedMedia.insert', reset)
    editor.popups.onHide('embedMedia.insert', reset)
  }, [])

  const reset = (): void => {
    setCurrentTab(URL_TYPE.AUDIO)
    setError(null)
    setUrl(null)
  }

  const onCurrentTabChange = (tabName: string): void => {
    setCurrentTab(tabName)
    setUrl(null)
  }

  const getPlayerTemplate = (url: string): string => {
    if (currentTab === URL_TYPE.AUDIO) {
      return renderToStaticMarkup(<AudioPlayer url={url} />)
    }

    return renderToStaticMarkup(<VideoPlayer url={url} />)
  }

  const onUrlChange = (url: string): void => {
    if (editor.helpers.isURL(url)) {
      setError(null)
      setUrl(url)
      const template = getPlayerTemplate(url)

      editor.events.focus(true)
      editor.selection.restore()
      editor.html.insert(template)
      editor.events.trigger('change')
      editor.popups.hide('embedMedia.insert')
      reset()
    } else {
      setError('Please enter correct url.')
    }
  }

  return (
    <>
      {error && <Error error={error} clearError={() => setError(null)} />}
      {!error && (
        <>
          <Tabs defaultActiveKey={URL_TYPE.AUDIO} activeKey={currentTab} animated={false} onChange={onCurrentTabChange}>
            <TabPane
              tab={(
                <span>
                  <AudioOutlined />
                  Audio
                </span>
              )}
              key={URL_TYPE.AUDIO}
            >
              <InputUrl onUrlChange={onUrlChange} type={URL_TYPE.AUDIO} />
            </TabPane>
            <TabPane
              tab={(
                <span>
                  <VideoCameraOutlined />
                  Video
                </span>
              )}
              key={URL_TYPE.VIDEO}
            >
              <InputUrl onUrlChange={onUrlChange} type={URL_TYPE.VIDEO} />
            </TabPane>
          </Tabs>
        </>
      )}
    </>
  )
}

interface PlayerProps { url: string }

const AudioPlayer: React.FC<PlayerProps> = ({ url }) => (
  <div className="fr-rendered-audio-container">
    <iframe src={`/media_players/audio?url=${url}`} frameBorder="0" width="448px" height="100px" title="Audio Player" />
  </div>
)

const VideoPlayer: React.FC<PlayerProps> = ({ url }) => (
  <div className="fr-rendered-video-container">
    <iframe src={`/media_players/video?url=${url}`} frameBorder="0" width="620px" height="465px" title="Video Player" />
  </div>
)

interface InputUrlProps { onUrlChange(val: string): void, type: string }

const InputUrl: React.FC<InputUrlProps> = ({ onUrlChange, type }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) { inputRef.current.value = '' }
  })

  useEffect(() => {
    setTimeout(() => { inputRef.current?.focus() }, 10)
  }, [])

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (inputRef.current && e.which === 13) { onUrlChange(inputRef.current.value) }
  }

  return (
    <div className="fr-layer fr-active">
      <div className="fr-input-line">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Paste in a ${type} URL`}
          onKeyDown={handleOnKeyDown}
        />
      </div>
      <div className="fr-action-buttons">
        <Button onClick={() => { if (inputRef.current) { onUrlChange(inputRef.current.value) } }}>Insert</Button>
      </div>
    </div>
  )
}

interface ErrorProps {
  error: string
  clearError(): void
}

const Error: React.FC<ErrorProps> = ({ error, clearError }) => (
  <div className="fr-layer fr-active">
    <h3>{error}</h3>
    <Button onClick={clearError}>Ok</Button>
  </div>
)

export default EmbedMediaComponent
