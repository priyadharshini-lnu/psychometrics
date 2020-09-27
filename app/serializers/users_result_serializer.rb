# frozen_string_literal: true

class UsersResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :results, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_id, :embedded_data, :is_self, :as_manager,
             :manager_evaluation_status, :campaign_id, :available_translations, :translations,
             :selected_locale, :current_element, :current_page, :seedrandom, :expiry_date,
             :subject_datasheet, :highlights, :user_assessment_id, :external_scoring

  attribute :relationship

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer
  has_one :participant, serializer: Threesixty::EndUser::ParticipantSerializer

  def user_assessment_id
    participant&.id
  end

  def available_translations
    ::Translation.available_translation_for_assessment(object.assessment_id)
  end

  def translations
    translations = ::Translation.to_hash_for_assessment(object.assessment_id, locale)
    return {} if translations.empty?

    translations['question'] = translations['question'].each_with_object({}) do |(question_id, question_details), acc|
      question_text = question_details['questionText']
      question_text = Threesixty::PipedText::Perform.call!(question_text, piped_text_context)
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
    data_sheet_row_data(object.evaluator.email)
  end

  def subject_datasheet
    data_sheet_row_data(object.subject.email)
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
      score = object.external_results&.hogan_score&.dig('participant', 'assessment', 'score') || {}
      if score.present?
        return score.each_with_object({}) do |v, res|
          scales = Array.wrap(v['scales']['scale'])
          res[normalize_hogan_type(v['type'])] = scales.each_with_object({}) do |factor, inner_res|
            inner_res[factor['id']] = factor['__content__'].to_f
          end
        end
      end
    end
    {}
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

  def data_sheet_row_data(email)
    row = DatasheetRow.
          joins(:datasheet).
          find_by(datasheets: { project_id: campaign.project.id }, email: email)
    row&.data || {}
  end

  def normalize_hogan_type(type)
    return 'Raw' if type == 'RAW'
    return 'Percentile' if type == 'percentile'

    raise "Not supported hogan type #{type}"
  end

  def piped_text_context
    instance_options[:piped_text_context] || {}
  end
end
