# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  results       :jsonb
#  scoring       :jsonb
#  embedded_data :jsonb
#  status        :integer          default("not_started")
#  role          :integer          default("member")
#  completed_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  step          :integer
#  membership_id :integer
#  norm_data     :jsonb
#  agile_scoring :jsonb
#  started_at    :datetime
#

class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id,
             :hris, :hash_id, :norm_data, :assessment_id, :external_scoring, :data_sheet,
             :relationship, :available_translations, :selected_locale, :translations,
             :type, :occupations, :innovation_styles

  has_one :user, serializer: UserSerializer

  def type
    'single_assign'
  end

  def user_id
    object.evaluator_id || object.membership.user_id
  end

  # TODO (atanych): Do we still need this?
  def hris
    {}
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
    else
      object.membership.decorate(context: { current_membership: @instance_options[:membership] }).relationship if @instance_options[:membership]
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

    # TODO (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
  def external_scoring
    return {} if object.assessment.psychometric?
    return object.external_results if object.assessment.mindmill?
    if object.assessment.hogan?
      assign_report = object.original_assign.assigns_reports.find { |r| r.hogan_score.present? }
      score = assign_report&.hogan_score&.dig('participant', 'assessment', 'score') || {}
      if score.present?
        return score.each_with_object({}) do |v, res|
          res[normalize_hogan_type(v["type"])] = v["scales"]["scale"].each_with_object({}) do |factor, inner_res|
            inner_res[factor["id"]] = factor["__content__"].to_f
          end
        end
      end
    end
    {}
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

  def normalize_hogan_type(type)
    # TODO (shuja): Add subscale
    return 'RawScale' if type == 'RAW'
    return 'PercentileScale' if type == 'percentile'
    raise "Not supported hogan type #{type}"
  end
end
