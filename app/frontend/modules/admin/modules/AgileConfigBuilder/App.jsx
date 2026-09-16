import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { PageLoadSpinner } from '~/glint'
import store from './store'
import { fetchAgileConfig, updateSettings } from './actions'
import AgileConfigBuilder from './AgileConfigBuilder'
import AgileConfigHeader from './AgileConfigHeader'

const AgileBuilderContent = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [assessment, setAssessment] = useState(null)

  useEffect(() => {
    dispatch(fetchAgileConfig(id)).then(({ response }) => {
      dispatch(updateSettings(response.extra || {}))
      setAssessment(response)
    })
  }, [id])

  if (!assessment) return <PageLoadSpinner size="large" />

  const props = {
    assessmentId: assessment.assessmentId,
    config: assessment.config,
    translations: assessment.translations,
  }

  return (
    <>
      <AgileConfigHeader {...props} />
      <AgileConfigBuilder {...props} />
    </>
  )
}

export default function App () {
  return (
    <Provider store={store}>
      <AgileBuilderContent />
    </Provider>
  )
}
