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
  SubjectDataSheet: {
    predicate: 'EqualTo',
    value: '',
  },
  EvaluatorDataSheet: {
    predicate: 'EqualTo',
    value: '',
  },
  EvaluatorRelationship: {
    predicate: 'EqualTo',
    value: '',
  },
  UserType: {
    predicate: 'is',
    value: 'Registered',
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
  UserType: 'UserType',
}
