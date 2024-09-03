export default {
  UniqueGenerator: {
    children: false,
  },
  Block: {
    children: false,
    defaults: { current: null },
  },
  Branch: {
    children: true,
    allowedChildren: ['Block', 'Branch', 'Group', 'EmbeddedData', 'EndOfAssessment', 'Randomizer'],
    defaults: { conditions: [] },
    defaultsConditions: {
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
      DataSheet: {
        value: '',
        predicate: 'EqualTo',
      },
      SubjectDataSheet: {
        value: '',
        predicate: 'EqualTo',
      },
      EvaluatorRelationship: {
        value: '',
        predicate: 'EqualTo',
      },
      UserType: {
        predicate: 'is',
        value: 'Registered',
      },
    },
  },
  Conjoint: {
    children: false,
  },
  EmbeddedData: {
    children: false,
    defaults: {
      storage: [{
        key: null,
        value: null,
      }],
    },
  },
  EndOfAssessment: {
    children: false,
    defaults: {
      messageType: 'Default',
    },
  },
  Randomizer: {
    children: true,
    allowedChildren: ['Block', 'Branch', 'Group', 'EmbeddedData', 'Randomizer'],
    defaults: { number: 0 },
  },
  Reference: {
    children: false,
  },
  Group: {
    allowedChildren: ['Block', 'Branch', 'Group', 'EmbeddedData', 'EndOfAssessment', 'Randomizer'],
    children: true,
  },
}
