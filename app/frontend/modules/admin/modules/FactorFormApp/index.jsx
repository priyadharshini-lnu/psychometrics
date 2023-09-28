import Form from './Form'

export default function FactorFormApp ({
  scoringStrategies, factor, errors, factors,
}) {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Form scoringStrategies={scoringStrategies} factor={factor} errors={errors} factors={factors} />
    </div>
  )
}
