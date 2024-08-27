# frozen_string_literal: true

class Api::V2::Administration::Campaigns::FactorBenchmarkScoreResource < Api::V2::Administration::BaseResource
  attributes :id, :factor_id, :benchmark_score

  ransack_filters %i[filterable_fields]
end
