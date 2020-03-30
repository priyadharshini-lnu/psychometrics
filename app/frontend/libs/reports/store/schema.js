import { schema } from 'normalizr'

export const question = new schema.Entity('questions')
export const factor = new schema.Entity('factors')
export const block = new schema.Entity('blocks')

export const blocks = new schema.Entity('blocks', {
  questions: [question],
})

export const assessment = new schema.Entity('assessments', {
  blocks: [blocks],
})

export const module = new schema.Entity('modules')
export const page = new schema.Entity('pages', {
  modules: [module],
})

export const report = new schema.Entity('report', {
  pages: [page],
  assessments: [assessment],
})

export default report
