# frozen_string_literal: true

class Api::V2::Administration::UserAssessmentResource < Api::V2::Administration::BaseResource
  attributes :id, :name, :status, :schedule_time

  has_one :evaluator, class_name: 'User'
  has_one :subject, class_name: 'User'
  has_one :assessment

  delegate :name, to: :assessment, allow_nil: true

  ransack_filters %i[subject_id_eq campaign_id_eq workshop_activities preworks]
end
