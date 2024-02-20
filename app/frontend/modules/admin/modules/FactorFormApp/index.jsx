import Form from './Form'
import { DefaultAntThemeWrapper } from '~/glint'

export default function FactorFormApp ({
  scoringStrategies, factor, errors, factors,
}) {
  return (
    <DefaultAntThemeWrapper>
      <div className="ms" style={{ background: 'white' }}>
        <Form scoringStrategies={scoringStrategies} factor={factor} errors={errors} factors={factors} />
      </div>
    </DefaultAntThemeWrapper>
  )
}
