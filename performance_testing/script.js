import http from 'k6/http'
import { check } from 'k6'
// Run this with 'k6 run /path/to/script.js'
export const options = {
  scenarios: {
    open_model: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 3000,
      maxVUs: 3000,
    },
  },
}

export default function () {
  const res = http.get(
    'http://local.ttedev.me:3000/user_assessments/24393/assessment.json',
    {
      headers: {
        'X-Csrf-Token': 'sample xsrf token',
        Cookie: 'sample cookie',
        'Content-Type': 'application/json',
      },
    },
  )

  check(res, { 'status is 200 or 304': res => res.status === 200 || res.status === 304 })
}
