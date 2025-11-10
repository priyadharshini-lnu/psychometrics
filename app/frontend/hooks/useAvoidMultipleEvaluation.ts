import { useEffect, useState } from 'react'

const useAvoidMultipleEvaluation = (assessmentId, result, validateSession) => {
  const [showInvalidSession, setShowInvalidSession] = useState(false)

  useEffect(() => {
    if (!result?.id) { return }

    const evaluationSessionIdCheckChannel = new BroadcastChannel('evaluationSessionIdCheck')
    const evaluationSessionId = result?.evaluation_session_id

    let interval
    if (result.id && evaluationSessionId) {
      interval = setInterval(() => {
        validateSession(assessmentId, evaluationSessionId)
          .then(({ response }: {response: { evaluationSessionExistis: string }}) => {
            if (!response.evaluationSessionExistis) {
              setShowInvalidSession(true)
              clearInterval(interval)
              evaluationSessionIdCheckChannel.close()
            }
          })
      }, 15000)

      // deepcode ignore InsufficientPostmessageValidation: BroadcastChannel is inherently same-origin
      evaluationSessionIdCheckChannel.addEventListener('message', (e) => {
        if (e.data.type === 'DuplicateEvaluationSessionIdFound' && e.data.evaluationSessionId === evaluationSessionId) {
          location.reload()
        }

        if (e.data.type === 'CheckDuplicateEvaluationSessionId') {
          if (e.data.evaluationSessionId !== evaluationSessionId) return
          evaluationSessionIdCheckChannel.postMessage({
            type: 'DuplicateEvaluationSessionIdFound', evaluationSessionId,
          })
          setShowInvalidSession(true)
          interval && clearInterval(interval)
        }
      })
      evaluationSessionIdCheckChannel.postMessage({ type: 'CheckDuplicateEvaluationSessionId', evaluationSessionId })
    }
    return () => {
      interval && clearInterval(interval)
      evaluationSessionIdCheckChannel && evaluationSessionIdCheckChannel.close()
    }
  }, [result])

  return [showInvalidSession, setShowInvalidSession] as [boolean, (val: boolean) => void]
}

export default useAvoidMultipleEvaluation
