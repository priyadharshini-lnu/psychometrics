# frozen_string_literal: true

class UserAssessment < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :campaign
  belongs_to :norm
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessor
  belongs_to :relationship
  belongs_to :users_result, dependent: :destroy
  has_one :mindmill_credential, through: :users_result
  has_one :project, through: :campaign

  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5 }
  enum completion_reason: { user_completed: 0, time_out_online: 1, time_out_offline: 2 }
  enum manager_nomination_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_nomination
  enum evaluator_nomination_status: { waiting: 0, completed: 1, declined: 2 }, _prefix: :evaluator_nomination
  enum manager_evaluation_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_evaluation

  has_one :threesixty_campaign, through: :campaign
  delegate :selected_locale, to: :users_result, allow_nil: true

  scope :sort_by_subject_name_asc, -> { joins(:subject).merge(User.sort_by_full_name_asc) }
  scope :sort_by_subject_name_desc, -> { joins(:subject).merge(User.sort_by_full_name_desc) }

  scope :filter_by_subject_or_assessment, lambda { |query|
    joins(:subject, :assessment).where(
      'users.first_name ILIKE :query OR users.last_name ILIKE :query OR users.email ILIKE :query OR
      assessments.name ILIKE :query',
      query: "%#{query}%"
    )
  }
  scope :actual_by_options, lambda { |options|
    unless options.participants.dig('subject', 'can_evaluate_self')
      where('user_assessments.subject_id != user_assessments.evaluator_id')
    end
  }

  after_commit :set_campaign_user_completion_status, on: %i[create destroy]
  after_commit :set_campaign_user_completion_status, if: proc { status_previously_changed? }, on: %i[update]
  after_commit :send_completion_email, if: proc { status_previously_changed? && completed? }

  before_save :set_default_relationship

  def self.ransackable_scopes(_auth_object = nil)
    %i[filter_by_subject_or_assessment]
  end

  def norm_data
    { 'id' => norm_id }
  end

  def real_status
    return 'timed_out' if users_result&.expired? && !completed? && !ineligible? && !interrupted?

    status
  end

  def set_campaign_user_completion_status
    campaign_user = CampaignUser.find_by(user_id: subject_id, campaign_id: campaign_id)
    CampaignUsers::SetCompletionStatus.call!(campaign_user) if campaign_user
  end

  def send_completion_email
    ::Communications::CompletionTypeJob.perform_later(users_result)
  end

  def set_default_relationship
    self.relationship_id = Relationship.self_relationship&.id unless relationship_id
  end

  def user
    evaluator
  end

  def self.statuses_count
    statuses.keys.each_with_object({}) { |status, acc| acc[status.to_sym] = 0 }
  end

  def campaign_user
    CampaignUser.find_by(campaign_id: campaign_id, user_id: evaluator_id)
  end

  alias result users_result
end
