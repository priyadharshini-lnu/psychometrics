# frozen_string_literal: true

class UsersResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :results, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_id, :embedded_data, :is_self, :as_manager,
             :campaign_id, :available_translations, :translations,
             :selected_locale, :current_element, :current_page, :seedrandom,
             :subject_datasheet, :highlights, :user_assessment_id, :started_at,
             :prev_pages, :timed_out, :completed_at, :factors, :remaining_campaign_time,
             :remaining_assessment_time, :reset_count, :hash_id, :proctoring_enabled,
             :privacy_consent_required, :other_pending_assessments_count, :prework

  attribute :relationship

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer
  has_one :participant, serializer: Threesixty::EndUser::ParticipantSerializer
  has_many :media_responses, serializer: MediaResponseSerializer

  has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer
  has_one :campaign_user, serializer: ::EndUser::CampaignUserSerializer
  delegate :campaign_options, to: :campaign
  has_many :factors, serializer: ::UsersResults::FactorSerializer

  delegate :reset_count, :started_at, :prework, :other_pending_assessments_count, to: :user_assessment
  delegate :remaining_campaign_time, to: :campaign_user, allow_nil: true

  def privacy_consent_required
    current_user.privacy_consent_required?
  end

  def hash_id
    object.encoded_id
  end

  def proctoring_enabled
    campaign_user&.proctoring_enabled?
  end

  def remaining_assessment_time
    return unless user_assessment.expiry_date
    return if object.not_started?

    assessment_time_left = [user_assessment.expiry_date - Time.zone.now, 0].max

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

    user_assessment.expired?
  end

  def campaign_user
    campaign.campaign_users.find_by(user_id: current_user.id) if current_user
  end

  def user_assessment_id
    participant&.id
  end

  def available_translations
    participant&.available_locales || ['en']
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

  delegate :id, to: :campaign, prefix: true

  def results
    object.answers
  end

  def is_self
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
    instance_options[:locale] || user_assessment.selected_locale || I18n.default_locale
  end

  def piped_text_context
    instance_options[:piped_text_context] || {}
  end

  def user_assessment
    object.user_assessment
  end
end
