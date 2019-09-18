import React from 'react'
import _ from 'lodash'

const Input = ({ resourceName, name, value }) => <input type="hidden" name={`${resourceName}[${name}]`} value={value} />

export default function HiddenInputList ({ resource, resourceName }) {
  return _.map(resource, (value, name) => {
    if (_.isArray(value)) {
      return value.map((v, i) => <HiddenInputList key={i} resource={v} resourceName={`${resourceName}[${name}][]`} />)
    }
    return <Input key={name} resourceName={resourceName} name={name} value={value || ''} />
  })
}
