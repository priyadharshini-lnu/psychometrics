import * as t from 'io-ts'

export const SuccessMessageTR = t.type({
  message: t.string,
})

export type SuccessMessage = t.TypeOf<typeof SuccessMessageTR>
