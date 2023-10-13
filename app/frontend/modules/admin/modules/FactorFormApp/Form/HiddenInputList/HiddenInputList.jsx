import _ from 'lodash'
import { getNonEmptyValue } from '~/utils/general'

export default function HiddenInputList ({ resource, resourceName }) {
  return _.map(resource, (value, name) => {
    if (_.isArray(value) && value.length > 0) {
      return value.map((v, i) => (
        <HiddenInputList
          key={i}
          resource={v}
          resourceName={`${resourceName}[${name}][]`}
        />
      ))
    }

    if (_.isArray(value) && value.length === 0) {
      return (
        <input
          key={name}
          type="hidden"
          name={`${resourceName}[${name}][]`}
          value={[]}
        />
      )
    }

    return <Input key={name} resourceName={resourceName} name={name} value={getNonEmptyValue(value)} />
  })
}

const Input = ({ resourceName, name, value }) => (
  <input
    type="hidden"
    name={`${resourceName}[${name}]`}
    value={value}
  />
)
