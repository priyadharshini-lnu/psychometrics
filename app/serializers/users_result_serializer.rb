# frozen_string_literal: true

class UsersResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :results, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_id, :embedded_data, :is_self, :as_manager,
             :manager_evaluation_status, :campaign_id, :available_translations, :translations,
             :selected_locale

  attribute :relationship, if: -> { object.assessment.threesixty? }

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer
  has_one :participant, serializer: Threesixty::EndUser::ParticipantSerializer

  def available_translations
    ::Translation.available_translation_for_assessment(object.assessment_id)
  end

  def translations
    translations = ::Translation.to_hash_for_assessment(object.assessment_id, locale)
    return {} if translations.empty?

    translations['question'] = translations['question'].each_with_object({}) do |(question_id, question_details), acc|
      question_text = question_details['questionText']
      question_text = Threesixty::PipedText::Perform.call!(question_text, instance_options[:piped_text_context])
      acc[question_id] = question_details.merge('questionText' => question_text)
    end

    translations
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
    object.evaluator_id != current_user.id
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
    participant&.relationship&.name
  end

  def data_sheet
    row = DatasheetRow.
          joins(:datasheet).
          find_by(datasheets: { project_id: campaign.project.id }, email: object.evaluator.email)
    row&.data || {}
  end

  def normalize_hogan_type(type)
    return 'Raw' if type == 'RAW'
    return 'Percentile' if type == 'percentile'

    raise "Not supported hogan type #{type}"
  end

  def participant
    @participant ||= instance_options[:participant]
  end

  private

  def campaign
    @campaign ||= instance_options[:campaign]
  end

  def current_user
    instance_options[:current_user]
  end

  def locale
    instance_options[:locale] || I18n.default_locale
  end
end
