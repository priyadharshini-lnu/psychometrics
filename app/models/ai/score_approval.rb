# frozen_string_literal: true

class AI::ScoreApproval < ApplicationRecord
  include GeoFilterable
  include WorkflowActiverecord

  audited

  self.table_name = 'user_assessments'

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :users_result
  has_one :project, through: :campaign
  has_one :client, through: :project
  belongs_to :subject, class_name: 'User'
  belongs_to :score_assessed_by, class_name: 'User'
  belongs_to :score_approved_by, class_name: 'User'

  attr_accessor :skip_event_emails

  workflow_column :approval_status
  workflow do # rubocop:disable Metrics/BlockLength
    state :pending do
      event :approve, transitions_to: :assessor_approved
      event :approver_approve, transitions_to: :approver_approved
    end
    state :assessor_approved do
      event :approve, transitions_to: :approver_approved
      event :approver_approve, transitions_to: :approver_approved
      event :abort, transitions_to: :pending
    end
    state :approver_approved do
      event :remove_approval, transitions_to: :pending, if: ->(score_approval) { score_approval.one_level_approve? }
      event :remove_approval, transitions_to: :assessor_approved,
                              if: ->(score_approval) { !score_approval.one_level_approve? }
    end
    state :auto_approved do
      event :reset, transitions_to: :pending
    end

    on_transition do |_from, to, _event, *_|
      update(approval_status_updated_at: Time.current)
      unless setting&.do_not_send_notifications? || skip_event_emails
        ::ScoreApprovals::NotifyApprovers.call!(self) if to == :assessor_approved
        ::ScoreApprovals::NotifyApprovalNotifications.call!(self) if to == :approver_approved
        ::ScoreApprovals::NotifyAssessors.call!(self) if to == :pending
      end
      merge_and_run_post_scoring_tasks! if to == :approver_approved
      clear_approver_details! if to == :assessor_approved
      clear_assessor_and_approver_details! if to == :pending
    end
  end

  def as_user_assessment
    becomes(UserAssessment)
  end

  delegate :users_result, to: :as_user_assessment

  def setting
    @setting ||= AI::ScoringApprovalSetting.find_by(
      campaign_id: campaign_id,
      assessment_id: assessment_id
    )
  end

  def one_level_approve?
    setting&.one_level_approve? || false
  end

  def allow_bulk_approve?
    setting&.allow_bulk_approve?
  end

  def allow_bulk_approve_scores?
    setting&.allow_bulk_approve_scores?
  end

  ransack_alias :project_id, :campaign_project_id
  ransack_alias :client_id, :campaign_project_tte_id

  def self.ransackable_attributes(_auth_object = nil)
    %w[id approval_status campaign_id project_id client_id subject_id assessor_id approver_id assessment_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[campaign project client subject assessment]
  end

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    restricted_campaign_subquery =
      Campaign.joins(:project).
      where(clients: { tte_id: restricted_client_subquery }).
      select(:id)

    where.not(campaign_id: restricted_campaign_subquery)
  end

  private

  def merge_and_run_post_scoring_tasks!
    ::UsersResults::Scoring::MergeAIScoresJob.perform_later(users_result.id, rescore: false)
  end

  def clear_approver_details!
    update(score_approved_by_id: nil, score_approved_at: nil)
  end

  def clear_assessor_and_approver_details!
    update(score_assessed_by_id: nil, score_assessed_at: nil, score_approved_by_id: nil, score_approved_at: nil)
  end
end
