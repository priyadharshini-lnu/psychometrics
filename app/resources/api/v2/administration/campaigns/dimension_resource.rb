# frozen_string_literal: true

class Api::V2::Administration::Campaigns::DimensionResource < Api::V2::Administration::BaseResource
  attributes :id, :name

  ransack_filters %i[filterable_fields]
end
