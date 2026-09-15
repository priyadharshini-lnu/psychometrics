# frozen_string_literal: true

class Api::V2::Administration::Threesixty::AssessmentResource < Api::V2::Administration::BaseResource
  attribute :id, format: :id
  attributes :name, :dimension_id
end
