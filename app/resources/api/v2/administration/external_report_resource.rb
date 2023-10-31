# frozen_string_literal: true

class Api::V2::Administration::ExternalReportResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[type_eq assessment_ids_in]
end
