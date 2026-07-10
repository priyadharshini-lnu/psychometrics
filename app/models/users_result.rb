# frozen_string_literal: true

class UsersResult < ApplicationRecord
  include GeoFilterable

  audited

  include EncodableId

  has_one :participant, class_name: 'Threesixty::Participant'
  has_many :media_responses, dependent: :destroy
  belongs_to :occupation_condition_set, optional: true
  has_one :user_assessment
  has_one :norm, through: :user_assessment
  has_one :campaign, through: :user_assessment
  has_many :ai_factor_scores, class_name: 'AI::FactorScore', dependent: :destroy
  has_one :threesixty_campaign, through: :campaign
  has_one :subject, through: :user_assessment
  has_one :evaluator, through: :user_assessment
  has_one :assessment, through: :user_assessment
  has_one :saville_user_assessment, through: :user_assessment
  has_one :pearson_user_assessment, through: :user_assessment
  has_one :mettl_user_assessment, through: :user_assessment
  has_one :simulation_user_assessment, through: :user_assessment
  has_one :skillvue_user_assessment, through: :user_assessment
  has_one :microsite_user_assessment, through: :user_assessment
  has_one :yoodli_user_assessment, through: :user_assessment

  has_one :agile, through: :assessment
  has_many :agile_events, dependent: :destroy

  include Tenantable

  tenant_source :user_assessment

  enum :ai_scoring_status, {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3
  }, prefix: :ai_scoring

  scope :actual_by_options, lambda { |options|
    unless options.participants.dig('subject', 'can_evaluate_self')
      joins(:user_assessment).merge(::Threesixty::Participant.actual_by_options(options))
    end
  }

  def ai_scoring_errors
    AI::QuestionScoringSession.
      where(resource: user_assessment, status: :failed).
      pluck(:assistable_id, :error).
      filter_map do |question_id, message|
        next if message.blank?

        "question_#{question_id}: #{message}"
      end.
      join('; ').
      presence
  end

  scope :agile, -> { joins(:assessment).where(assessments: { type: Assessment::TYPES[:agile] }) }

  delegate :subject_id, :evaluator_id, :assessment_id, :campaign_id, :norm_id, :status, :real_status,
           :norm_data, :completed_at, :started_at, :completion_reason, :available_locales,
           :user_reports, :user, :user_id, :campaign_user, :deemed_completed?, :completion_status_code,
           :score_calculated, :score_calculated_at, :ai_scoring_approved?,
           to: :user_assessment, allow_nil: true
  delegate(*UserAssessment.statuses.keys.map { |status| [:"#{status}?", :"#{status}!"] }.flatten,
           to: :user_assessment, allow_nil: true)

  before_create :generate_randomseed
  after_commit :compute_external_scores, if: -> { external_results_previously_changed? }, on: %i[update]

  def compute_external_scores
    return if external_results.blank? || assessment.internal?

    ::UsersResults::SaveScoringJob.set(wait: 10.seconds).perform_later(self)
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

  def resolve_occupation_condition_set
    occupation_condition_set ||
      user_assessment.campaign_assessment&.occupation_condition_set ||
      assessment&.dimension&.default_occupation_condition_set
  end

  def ready_for_ai_scoring?
    return false if assessment.ai_assistant.blank?
    return false unless completed?
    return false unless all_transcriptions_completed?

    true
  end

  def ai_content_analysis_enabled?
    project = campaign&.project
    return false if project.blank?
    return false unless Settings.features.ai_content_analysis_enabled
    return false unless project.project_feature_enabled?(:ai_content_analysis)

    true
  end

  def trigger_ai_scoring
    return unless ready_for_ai_scoring?

    AI::ContentAnalysis::TriggerAIScoringJob.perform_later(id)
  end

  def all_transcriptions_completed?
    questions = transcription_required_ai_questions
    return true if questions.empty?

    questions.all? do |question|
      active_response = active_media_response(question)
      active_response.nil? || active_response.transcription_completed?
    end
  end

  def active_media_response(question)
    responses = media_responses.where(question_id: question.id).select { |r| r.asset.attached? }

    return nil if responses.empty?

    selected_responses = responses.select(&:user_selected)

    if selected_responses.any?
      selected_responses.max_by(&:id)
    else
      responses.max_by(&:id)
    end
  end

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(user_assessment: { campaign: :project }).
      where.not(clients: { tte_id: restricted_client_subquery })
  end

  private

  def transcription_required_ai_questions
    assessment.questions.ai_scored.
      where(type: %w[VideoResponse AudioResponse]).
      where("props ->> 'enableTranscription' = ?", 'true')
  end
end
