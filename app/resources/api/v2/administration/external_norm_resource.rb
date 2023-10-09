# frozen_string_literal: true

class Api::V2::Administration::ExternalNormResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[type_eq assessment_id_eq]
end
