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
    defaults: { number: 0 },
  },
  Reference: {
    children: false,
  },
}
