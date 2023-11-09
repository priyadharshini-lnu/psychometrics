
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
    url: `/meeting_rooms/${roomId}/token`,
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
  const { roomId } = useParams<{roomId: string}>()
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    fetchMeeting(roomId).then((res:{ response:{token: string, url:string} }) => {
      setToken(res.response.token)
      setUrl(res.response.url)
    })
  }, [])

  useEffect(() => {
    window.$chatwoot?.toggleBubbleVisibility('hide')
    return () => {
      window.$chatwoot?.toggleBubbleVisibility('show')
    }
  }, [])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 50px)', marginTop: '50px' }}>
      <Suspense fallback={<h3>Still Loading…</h3>}>
        {token && url && (<Meet token={token} url={url} />)}
      </Suspense>
    </div>
  )
}

export default connecter(MeetingRoom)
