# frozen_string_literal: true

class UsersResult < ApplicationRecord
  include EncodableId

  has_one :participant, class_name: 'Threesixty::Participant'
  has_many :media_responses, dependent: :destroy
  has_one :user_assessment
  has_one :norm, through: :user_assessment
  has_one :campaign, through: :user_assessment
  has_one :threesixty_campaign, through: :campaign
  has_one :subject, through: :user_assessment
  has_one :evaluator, through: :user_assessment
  has_one :assessment, through: :user_assessment
  has_one :mindmill_credential, dependent: :destroy
  has_one :agile, through: :assessment
  has_many :agile_events, dependent: :destroy

  scope :actual_by_options, lambda { |options|
    unless options.participants.dig('subject', 'can_evaluate_self')
      joins(:user_assessment).merge(::Threesixty::Participant.actual_by_options(options))
    end
  }

  scope :mindmill, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:mindmill] }) }
  scope :agile, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:agile] }) }

  delegate :subject_id, :evaluator_id, :assessment_id, :campaign_id, :norm_id, :norm_type, :status, :real_status,
           :norm_data, :completed_at, :completion_reason, :user_reports, :available_locales,
           to: :user_assessment, allow_nil: true
  delegate(*UserAssessment.statuses.keys.map { |status| [:"#{status}?", :"#{status}!"] }.flatten,
           to: :user_assessment, allow_nil: true)

  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end

  def timed?
    expiry_date.present?
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current || campaign_time_over?
  end

  def campaign_time_over?
    campaign_user&.real_expiry_date && campaign_user.real_expiry_date < Time.current
  end

  def campaign_user
    campaign.campaign_users.find_by(user_id: user_id)
  end

  def user
    evaluator
  end

  def user_id
    evaluator_id
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
end
