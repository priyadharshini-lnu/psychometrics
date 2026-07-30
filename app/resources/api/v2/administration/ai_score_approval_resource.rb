# frozen_string_literal: true

class Api::V2::Administration::AIScoreApprovalResource < Api::V2::Administration::BaseResource
  model_name 'AI::ScoreApproval'

  attributes :approval_status, :approver_ids, :project_id, :campaign_id, :client_id,
             :approval_status_updated_at, :allow_bulk_approve, :allow_bulk_approve_scores

  has_one :assessment
  has_one :campaign
  has_one :project
  has_one :client
  has_one :subject, class_name: 'User'
  has_one :score_assessed_by, class_name: 'User'
  has_one :score_approved_by, class_name: 'User'

  ransack_filters %i[campaign_id_eq campaign_id_in campaign_name_cont
                     assessment_id_eq assessment_id_in assessment_name_cont
                     project_id_eq project_id_in project_name_cont
                     client_id_eq client_id_in client_name_cont
                     subject_id_eq subject_email_cont subject_full_name_cont
                     approval_status_in]

  filter :my_tasks, apply: lambda { |records, _, options|
    records.merge(AI::ScoringApprovalSetting.user_tasks(options[:context][:user]))
  }

  filter :approved, apply: lambda { |records, _, options|
    records.merge(AI::ScoringApprovalSetting.approved_for(options[:context][:user]))
  }

  def project_id
    @model.project.id
  end

  def client_id
    @model.client.id
  end

  def allow_bulk_approve
    @model.allow_bulk_approve?
  end

  def allow_bulk_approve_scores
    @model.allow_bulk_approve_scores?
  end

  def self.records(_)
    super.includes(assessment: :translations).
      select('user_assessments.*', 'assessor_ids', 'approver_ids',
             'allow_bulk_approve', 'allow_bulk_approve_scores')
  end
end
