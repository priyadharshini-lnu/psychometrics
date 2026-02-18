# frozen_string_literal: true

class Api::V2::Administration::UserAssessmentResource < Api::V2::Administration::BaseResource
  attributes :name, :status, :schedule_time, :linked_subject_meeting_link

  has_one :evaluator, class_name: 'User'
  has_one :subject, class_name: 'User'
  has_one :assessment
  has_one :campaign

  delegate :name, to: :assessment, allow_nil: true

  ransack_filters %i[subject_id_eq campaign_id_eq workshop_activities preworks campaign_assessment_group_eq]

  filter :my_tasks, apply: lambda { |records, _, options|
    records.merge(AI::ScoringApprovalSetting.user_tasks(options[:context][:user]))
  }

  def linked_subject_meeting_link
    @model.linked_subject_user_assessment&.real_meeting_link(context[:user])
  end
end
