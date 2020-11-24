# frozen_string_literal: true

class UsersResult < ApplicationRecord
  include EncodableId

  belongs_to :campaign
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessment
  belongs_to :norm
  has_one :participant, class_name: 'Threesixty::Participant'
  belongs_to :campaign
  belongs_to :norm
  has_one :threesixty_campaign, through: :campaign
  has_many :media_responses, dependent: :destroy
  has_one :user_assessment
  has_one :mindmill_credential, dependent: :destroy
  has_one :agile, through: :assessment
  has_many :agile_events, dependent: :destroy

  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3 }
  enum completion_reason: { user_completed: 0, time_out_online: 1, time_out_offline: 2 }

  scope :actual_by_options, lambda { |options|
    where('subject_id != evaluator_id') unless options.participants.dig('subject', 'can_evaluate_self')
  }

  scope :mindmill, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:mindmill] }) }
  scope :agile, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:agile] }) }

  after_commit :send_completion_email, if: proc { status_previously_changed? && completed? }

  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current || campaign_time_over?(evaluator_id)
  end

  def campaign_time_over?(user_id)
    options = user_assessment.campaign.campaign_options
    return false unless options&.fixed_time

    campaign_user = user_assessment.campaign.campaign_users.find_by(user_id: user_id)
    return false unless campaign_user.started_at

    campaign_user.started_at + options.fixed_time_duration.minutes < Time.current
  end

  def user
    evaluator
  end

  def user_id
    evaluator_id
  end

  def user_reports
    UserReport.where(report_id: assessment.report_ids, user_id: subject_id)
  end

  def hogan_user_reports
    hogan_reports = assessment.reports.select(&:hogan?)

    return UserReport.none if hogan_reports.blank?

    UserReport.where(
      report_id: hogan_reports.pluck(:id),
      user_id: subject_id,
      campaign_id: user_assessment.campaign_id
    )
  end

  def mindmill_user_reports
    mindmill_reports = assessment.reports.select(&:mindmill?)

    return UserReport.none if mindmill_reports.blank?

    UserReport.where(
      report_id: mindmill_reports.pluck(:id),
      user_id: subject_id,
      campaign_id: user_assessment.campaign_id
    )
  end

  def extra_time_buffer_expired?
    return false unless expiry_date

    expiry_date.advance(minutes: 5) < Time.current
  end

  # TODO: Remove all reference of answer_key after Assign model is removed
  def answer_key
    'answers'
  end

  def send_completion_email
    ::Communications::CompletionTypeJob.perform_later(self)
  end

  def norm_data
    { 'id' => norm_id, 'type' => norm_type }
  end
end
