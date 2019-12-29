import { schema } from 'normalizr'
// Define a users schema
export const question = new schema.Entity('questions')
export const factor = new schema.Entity('factors')
export const block = new schema.Entity('blocks')

export const blocks = new schema.Entity('blocks', {
  questions: [question],
})

export const assessment = new schema.Entity('assessment', {
  blocks: [blocks],
  factors: [factor],
})

export default assessment
