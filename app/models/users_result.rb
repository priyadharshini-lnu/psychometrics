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
  has_many :media_responses
  has_many :user_assessments
  has_one :mindmill_credential

  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3 }

  scope :actual_by_options, lambda { |options|
    where('subject_id != evaluator_id') unless options.participants.dig('subject', 'can_evaluate_self')
  }

  scope :mindmill, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:mindmill] }) }

  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current
  end

  def user
    evaluator
  end

  def user_id
    evaluator_id
  end

  def user_reports
    UserReport.where(report_id: assessment.report_ids, user_id: subject_id, campaign_id: campaign_ids)
  end

  def mindmill_user_reports
    mindmill_report = assessment.reports.find(&:mindmill?)

    return UserReport.none unless mindmill_report

    UserReport.where(report_id: mindmill_report.id, user_id: subject_id, campaign_id: campaign_ids)
  end

  def campaign_ids
    user_assessments.pluck(:campaign_id)
  end

  def extra_time_buffer_expired?
    return false unless expiry_date

    expiry_date.advance(minutes: 5) < Time.current
  end
end
