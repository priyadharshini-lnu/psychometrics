# frozen_string_literal: true

class Api::V2::Administration::QuestionResource < Api::V2::Administration::BaseResource
  attributes :type, :name, :props

  ransack_filters %i[assessment_id_eq type_in filterable_fields]
end
