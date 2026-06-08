import React from 'react'
import { JsonDiffComponent, JsonValue } from 'json-diff-react'
import { Alert } from 'antd'

interface JsonDiffProps {
  oldChanges?: JsonValue;
  newChanges?: JsonValue;
}

const { I18n } = window
const Diff = ({ oldChanges, newChanges }) => (
  <JsonDiffComponent
    jsonA={oldChanges}
    jsonB={newChanges}
    jsonDiffOptions={{
      maxElisions: 2,
      renderElision:
      (n, max) => ((n < max) ? [...Array(n)].map(() => '…') : `… (${n} entries)`),
    }}
    styleCustomization={{
      additionLineStyle: { color: 'green' },
      deletionLineStyle: { color: 'red' },
      unchangedLineStyle: { color: 'gray' },
      frameStyle: {
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        background: 'white',
      },
    }}
  />
)
const JsonDiff: React.FC<JsonDiffProps> = ({ oldChanges, newChanges }) => {
  const jsonOldInput = JSON.stringify(oldChanges, null, 2)
  const jsonNewInput = JSON.stringify(newChanges, null, 2)

  let error: string | null = null

  let jsonOld = null
  try {
    jsonOld = JSON.parse(jsonOldInput)
  } catch (e) {
    error = `${I18n.t('admin.active_record_audits_old_diff_parse_error')}: ${e?.message ?? JSON.stringify(e)}`
  }

  let jsonNew = null
  try {
    jsonNew = JSON.parse(jsonNewInput)
  } catch (e) {
    error = `${I18n.t('admin.active_record_audits_new_diff_parse_error')}: ${e?.message ?? JSON.stringify(e)}`
  }

  return (
    <>
      {error !== null ? (
        <Alert message={error} type="error" />
      ) : (
        <Diff oldChanges={jsonOld} newChanges={jsonNew} />
      )}
    </>
  )
}

export default JsonDiff
