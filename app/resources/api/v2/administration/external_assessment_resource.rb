# frozen_string_literal: true

class Api::V2::Administration::ExternalAssessmentResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[type_eq project_id_eq filterable_fields]
end
