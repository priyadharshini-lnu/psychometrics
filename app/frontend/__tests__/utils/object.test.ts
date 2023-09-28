import { isEqual } from 'lodash'
import { camelizeKeys } from '~/utils/object'

const data = {
  user_data: {
    name: {
      first_name: 'John',
      last_name: 'Doe'
    },
    birth_details: {
      city_born_in: 'London'
    },
    enable_2fa: true
  },
  data_capturer: {
    company_details: {
      registered_name: 'Data capturer LTD'
    }
  }
}

test('camelize all keys if no except or only option is passed', () => {
  expect(camelizeKeys(data)).toMatchObject({
    userData: {
      name: {
        firstName: 'John',
        lastName: 'Doe'
      },
      birthDetails: {
        cityBornIn: 'London'
      },
      enable2fa: true
    },
    dataCapturer: {
      companyDetails: {
        registeredName: 'Data capturer LTD'
      }
    }
  })
})

test("doesn't camelize paths passed in except option", () => {
  expect(camelizeKeys(data, { except: ['$.user_data.name', '$.user_data.enable_2fa'] })).toMatchObject({
    userData: {
      name: {
        first_name: 'John',
        last_name: 'Doe'
      },
      birthDetails: {
        cityBornIn: 'London'
      },
      enable_2fa: true
    },
    dataCapturer: {
      companyDetails: {
        registeredName: 'Data capturer LTD'
      }
    }
  })
})

test('only camelize path passed in only option', () => {
  expect(camelizeKeys(data, { only: ['$.user_data.name', '$.data_capturer'] })).toMatchObject({
    user_data: {
      name: {
        firstName: 'John',
        lastName: 'Doe'
      },
      birth_details: {
        city_born_in: 'London'
      },
      enable_2fa: true
    },
    data_capturer: {
      companyDetails: {
        registeredName: 'Data capturer LTD'
      }
    }
  })
})

test('handles except path which are not present in data', () => {
  expect(camelizeKeys(data, { except: ['$.user_data.name', '$.not_present.something'] })).toMatchObject({
    userData: {
      name: {
        first_name: 'John',
        last_name: 'Doe'
      },
      birthDetails: {
        cityBornIn: 'London'
      },
      enable2fa: true
    },
    dataCapturer: {
      companyDetails: {
        registeredName: 'Data capturer LTD'
      }
    }
  })
})

test('handles only path which is not present in data', () => {
  expect(camelizeKeys(data, { only: ['$.user_data.name', '$.not_present.something'] })).toMatchObject({
    user_data: {
      name: {
        firstName: 'John',
        lastName: 'Doe'
      },
      birth_details: {
        city_born_in: 'London'
      },
      enable_2fa: true
    },
    data_capturer: {
      company_details: {
        registered_name: 'Data capturer LTD'
      }
    }
  })
})

test('throws error if both except and only option is specified', () => {
  expect(() => {
    camelizeKeys(data, { only: ['$.user_data'], except: ['$.data_capturer'] })
  }).toThrow(
    "Both only and except options can't be used together"
  )
})
