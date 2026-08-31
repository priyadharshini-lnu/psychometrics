import Form from './Form'
import { GlintAdminTheme } from '~/components/AdminShell/GlintAdminTheme'

export default function FactorFormApp ({
  scoringStrategies, factor, errors, factors,
}) {
  return (
    <GlintAdminTheme>
      <div className="ms" style={{ background: 'white' }}>
        <Form scoringStrategies={scoringStrategies} factor={factor} errors={errors} factors={factors} />
      </div>
    </GlintAdminTheme>
  )
}
