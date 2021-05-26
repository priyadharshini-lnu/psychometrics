# frozen_string_literal: true

class UsersResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :results, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_id, :embedded_data, :is_self, :as_manager,
             :manager_evaluation_status, :campaign_id, :available_translations, :translations,
             :selected_locale, :current_element, :current_page, :seedrandom,
             :subject_datasheet, :highlights, :user_assessment_id, :external_scoring, :started_at,
             :prev_pages, :timed_out, :completed_at, :factors, :remaining_campaign_time,
             :remaining_assessment_time, :reset_count, :hash_id

  attribute :relationship

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer
  has_one :participant, serializer: Threesixty::EndUser::ParticipantSerializer
  has_many :media_responses, serializer: MediaResponseSerializer

  has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer
  has_one :campaign_user, serializer: ::EndUser::CampaignUserSerializer
  delegate :campaign_options, to: :campaign
  has_many :factors, serializer: ::UsersResults::FactorSerializer

  def hash_id
    object.encoded_id
  end

  def remaining_campaign_time
    return unless campaign_user&.real_expiry_date

    [campaign_user.real_expiry_date - Time.now, 0].max
  end

  def remaining_assessment_time
    return unless object.expiry_date

    assessment_time_left = [object.expiry_date - Time.now, 0].max

    return [assessment_time_left, remaining_campaign_time].min if remaining_campaign_time

    assessment_time_left
  end

  def status
    return 'in_progress' if instance_options[:read_only]

    object.real_status
  end

  def factors
    Factor.where(id: object.scoring&.keys)
  end

  def timed_out
    return false if instance_options[:read_only]

    object.expired?
  end

  def campaign_user
    campaign.campaign_users.find_by(user_id: current_user.id) if current_user
  end

  def user_assessment_id
    participant&.id
  end

  def available_translations
    ::Translation.available_translation_for_assessment(object.assessment_id)
  end

  def translations
    Assessments::GetTranslationWithPipetextReplaced.call!(
      object.assessment,
      piped_text_context: piped_text_context,
      locale: locale
    )
  end

  def selected_locale
    {
      code: locale,
      name: I18n.t("languages.#{locale}"),
      direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
    }
  end

  def campaign_id
    campaign.id
  end

  def results
    object.answers
  end

  def is_self # rubocop:disable Naming/PredicateName
    object.evaluator_id == object.subject_id
  end

  def as_manager
    object.evaluator_id != current_user&.id
  end

  def user
    object.evaluator
  end

  def user_id
    object.evaluator_id
  end

  def manager_evaluation_status
    participant&.manager_evaluation_status
  end

  def relationship
    return participant&.relationship&.name if object.assessment.threesixty?

    'Self'
  end

  def data_sheet
    campaign.datasheet_data(object.evaluator.email)
  end

  def subject_datasheet
    campaign.datasheet_data(object.subject.email)
  end

  def participant
    @participant ||= instance_options[:participant]
  end

  def highlights
    ids = [object.assessment_id]
    ids += object.assessment.resources.map { |r| r['assessmentId'] } if object.assessment.resources
    Highlight.where(assessment_id: ids, user_id: user_id).map do |h|
      HighlightSerializer.new(h)
    end
  end

  def external_scoring
    return object.external_results if object.assessment.mindmill?

    if object.assessment.hogan?
      score = object.external_results
      if score.present?
        raw_scale = score.dig('scores', 'rawScores', 'scaleScores') || []
        percentile_scale = score.dig('scores', 'percentileScores', 'scaleScores') || []
        percentile_subscale = score.dig('scores', 'percentileScores', 'subscaleScores') || []
        return {
          'RawScale' => normalize_hogan(raw_scale),
          'PercentileScale' => normalize_hogan(percentile_scale),
          'PercentileSubscale' => normalize_hogan(percentile_subscale)
        }
      end
    end
    {}
  end

  def media_responses
    object.media_responses.order(:created_at)
  end

  private

  def campaign
    @campaign ||= instance_options[:campaign]
  end

  def current_user
    instance_options[:current_user]
  end

  def locale
    instance_options[:locale] || object.selected_locale || I18n.default_locale
  end

  def normalize_hogan(items)
    items.each_with_object({}) do |v, res|
      res[v['id'].to_s.rjust(2, '0')] = (v['scaleScore'] || v['subscaleScore']).to_f
    end
  end

  def piped_text_context
    instance_options[:piped_text_context] || {}
  end
end
