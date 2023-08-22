# frozen_string_literal: true

class Api::V2::Administration::UserAssessmentResource < Api::V2::Administration::BaseResource
  attributes :schedule_time, :status
  has_one :evaluator, class_name: 'User'
  has_one :subject, class_name: 'User'
  has_one :assessment
end
