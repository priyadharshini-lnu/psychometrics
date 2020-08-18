export interface OwnProps {
  normId: number
  factors: Factor[]
}

export interface Factor {
  id: number
  name: string
  factors_norms_props: { mean: number, standard_deviation: number }[]
}
