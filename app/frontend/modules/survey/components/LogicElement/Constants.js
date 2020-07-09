export const DEFAULTS = {
  DeviceType: {
    value: 'Mobile',
    predicate: 'is',
  },
  Question: {
    value: '',
    predicate: '',
  },
  EmbeddedData: {
    value: '',
    predicate: 'EqualTo',
  },
  GeoIP: {
    key: 'zip_code',
    value: '',
    predicate: 'EqualTo',
  },
  EvaluatorRelationship: {
    predicate: 'EqualTo',
    value: '',
  },
}

export const TYPE_LABELS = {
  Question: 'Question',
  EmbeddedData: 'Embedded Data',
  DeviceType: 'Device Type',
  GeoIP: 'Geo IP Location',
  SubjectDataSheet: 'Subject DataSheet',
  EvaluatorDataSheet: 'Evaluator DataSheet',
  EvaluatorRelationship: 'Evaluator Relationship',
}
