import {
  lazy, Suspense, useEffect, useState,
} from 'react'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'

const Meet = lazy(() => import('~/glint/components/Meet'))

const MEETING = 'resource/users/Meeting'
const fetchMeeting = (roomId:string) => ({
  type: MEETING,
  request: {
    url: `/administration/meeting_rooms/${roomId}/token`,
    method: 'GET',
  },
})

const connecter = connect(() => ({
}), {
  fetchMeeting,
})

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const MeetingRoom = ({ fetchMeeting }: Props) => {
  const { roomId } = useParams() as {roomId: string}
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [recordingEnabled, setRecordingEnabled] = useState<boolean>(false)

  useEffect(() => {
    fetchMeeting(roomId).then((res:{ response:{token: string, url:string, videoRecordingEnabled: boolean} }) => {
      setToken(res.response.token)
      setUrl(res.response.url)
      setRecordingEnabled(res.response.videoRecordingEnabled)
    })
  }, [])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 50px)' }}>
      <Suspense fallback={<h3>Still Loading…</h3>}>
        {/* deepcode ignore OR: We are using sanitized url from our own backend */}
        {token && url && (<Meet token={token} url={url} recordingEnabled={recordingEnabled} />)}
      </Suspense>
    </div>
  )
}

export default connecter(MeetingRoom)
