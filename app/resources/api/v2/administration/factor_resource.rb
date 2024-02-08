# frozen_string_literal: true

class Api::V2::Administration::FactorResource < Api::V2::Administration::BaseResource
  attributes :id, :name

  ransack_filters %i[filterable_fields dimension_id_eq]
end
