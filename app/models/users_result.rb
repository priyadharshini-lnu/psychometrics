# frozen_string_literal: true

class UsersResult < ApplicationRecord
  audited

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
  has_one :saville_user_assessment, through: :user_assessment
  has_one :pearson_user_assessment, through: :user_assessment

  has_one :agile, through: :assessment
  has_many :agile_events, dependent: :destroy

  scope :actual_by_options, lambda { |options|
    unless options.participants.dig('subject', 'can_evaluate_self')
      joins(:user_assessment).merge(::Threesixty::Participant.actual_by_options(options))
    end
  }

  scope :mindmill, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:mindmill] }) }
  scope :agile, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:agile] }) }

  delegate :subject_id, :evaluator_id, :assessment_id, :campaign_id, :norm_id, :status, :real_status,
           :norm_data, :completed_at, :started_at, :completion_reason, :user_reports, :available_locales,
           :external_user_reports, :user, :user_id, :campaign_user,
           to: :user_assessment, allow_nil: true
  delegate(*UserAssessment.statuses.keys.map { |status| [:"#{status}?", :"#{status}!"] }.flatten,
           to: :user_assessment, allow_nil: true)

  before_create :generate_randomseed
  after_commit :compute_external_scores, if: -> { external_results_previously_changed? }

  def compute_external_scores
    return if !completed? || external_results.blank? || assessment.internal?

    update!(scoring: ::UsersResults::CalculateScoring.call!(self))
  end

  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end

  # TODO: Remove all reference of answer_key after Assign model is removed
  def answer_key
    'answers'
  end

  def generate_randomseed
    self.seedrandom = rand(1..100).to_s
  end
end
