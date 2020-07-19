import _ from 'lodash'

type Answers = Array<{ value: string, media_id: number, filename: string }>

interface Result {
  meta: object
  answers: Answers
}

export default class AudioResponse {
  result: Result

  constructor (result: Result) {
    this.result = result
  }

  meta = (data: object): void => {
    this.result.meta = data
  }

  answer = (url: string, mediaId: number, filename: string): void => {
    if (url) {
      this.result.answers = [{ value: url, media_id: mediaId, filename }]
    } else {
      this.result.answers = []
    }
  }

  results = (): Answers => this.result.answers

  requiredValidation = (): number => _.compact(_.map(this.result.answers, 'value')).length
}
