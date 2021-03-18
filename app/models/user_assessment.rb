# frozen_string_literal: true

class UserAssessment < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :campaign
  belongs_to :project, class_name: 'Client'
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessor
  belongs_to :relationship
  belongs_to :users_result, dependent: :destroy
  has_one :mindmill_credential, through: :users_result

  has_one :threesixty_campaign, through: :campaign
  delegate :selected_locale, :status, :real_status, to: :users_result, allow_nil: true

  scope :sort_by_subject_name_asc, -> { joins(:subject).merge(User.sort_by_full_name_asc) }
  scope :sort_by_subject_name_desc, -> { joins(:subject).merge(User.sort_by_full_name_desc) }

  scope :filter_by_subject_or_assessment, lambda { |query|
    joins(:subject, :assessment).where(
      'users.first_name ILIKE :query OR users.last_name ILIKE :query OR users.email ILIKE :query OR
      assessments.name ILIKE :query',
      query: "%#{query}%"
    )
  }

  after_commit :set_campaign_user_completion_status, on: %i[create destroy]
  before_save :set_default_relationship

  def self.ransackable_scopes(_auth_object = nil)
    %i[filter_by_subject_or_assessment]
  end

  def set_campaign_user_completion_status
    campaign_user = CampaignUser.find_by(user_id: subject_id, campaign_id: campaign_id)
    CampaignUsers::SetCompletionStatus.call!(campaign_user) if campaign_user
  end

  def set_default_relationship
    self.relationship_id = Relationship.self_relationship&.id unless relationship_id
  end

  def completed?
    users_result&.completed?
  end

  def user
    evaluator
  end

  alias result users_result
end
