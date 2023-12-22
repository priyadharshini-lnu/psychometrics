# frozen_string_literal: true

class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id,
             :hris, :hash_id, :norm_data, :assessment_id, :external_scoring, :data_sheet,
             :relationship, :available_translations, :selected_locale, :translations,
             :type, :occupations, :innovation_styles, :meta_data,
             :current_element, :current_page, :seedrandom, :reset_count, :highlights,
             :subject_datasheet, :prev_pages, :remaining_assessment_time, :report_data

  has_one :user, method: :user
  has_many :media_responses, method: :media_responses

  def user
    UserSerializer.new.serialize(object.user)
  end

  def media_responses
    Panko::ArraySerializer.new(
      object.media_responses,
      each_serializer: MediaResponseSerializer
    ).to_a
  end

  def remaining_assessment_time
    return unless object.expiry_date

    [object.expiry_date - Time.zone.now, 0].max
  end

  def status
    object.real_status
  end

  def type
    'single_assign'
  end

  def user_id
    object.evaluator_id || object.membership.user_id
  end

  # TODO: (atanych): Do we still need this?
  def hris
    {}
  end

  def highlights
    ids = [object.assessment_id]
    ids += object.assessment.resources.map { |r| r['assessmentId'] } if object.assessment.resources
    Highlight.where(assessment_id: ids, user_id: user_id).map do |h|
      HighlightSerializer.new(h)
    end
  end

  def relationship
    if object.assessment.threesixty?
      participant =
        # For multi assigns we should pass participant map in order to avoid N+1 queries
        if @instance_options[:participants_map]
          @instance_options[:participants_map][object.evaluator_id]
        else
          Threesixty::Participant.find_by(evaluator_id: object.evaluator_id, subject_id: object.subject_id)
        end
      participant&.relationship&.name
    elsif @instance_options[:membership]
      object.membership.decorate(context: { current_membership: @instance_options[:membership] }).relationship
    end
  end

  def hash_id
    object.encode_id
  end

  def available_translations
    ::Translation.available_translation_for_assessment(object.assessment_id)
  end

  def selected_locale
    locale = object.selected_locale || I18n.default_locale
    {
      code: locale,
      name: I18n.t("languages.#{locale}"),
      direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
    }
  end

  def translations
    ::Translation.to_hash_for_assessment(object.assessment_id, object.selected_locale || I18n.default_locale)
  end

  def norm_data
    object.norm_data[:name] = @instance_options[:norm] if @object.norm_data
    object.norm_data
  end

  # TODO: (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
  def external_scoring # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    return {} if object.assessment.psychometric?
    return object.external_results if object.assessment.mindmill?

    if object.assessment.hogan?
      assign_report = object.original_assign.assigns_reports.find { |r| r.hogan_score.present? }
      score = assign_report&.hogan_score || {}
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

  def report_data
    []
  end

  def data_sheet
    row =
      # For multi assigns we should pass data sheet map in order to avoid N+1 queries
      if @instance_options[:data_sheet_map]
        @instance_options[:data_sheet_map][object.evaluator.email]
      else
        DatasheetRow.joins(:datasheet).
          find_by(datasheets: { project_id: object.membership.client_id }, email: object.membership.user.email)
      end
    row&.data || {}
  end
  alias subject_datasheet data_sheet

  def normalize_hogan(items)
    items.each_with_object({}) do |v, res|
      res[v['id'].to_s.rjust(2, '0')] = (v['scaleScore'] || v['subscaleScore']).to_f
    end
  end
end
