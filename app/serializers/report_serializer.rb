# frozen_string_literal: true

class ReportSerializer < Panko::Serializer
  attributes :id, :name, :disabled, :created_at, :factors, :factor_norms, :occupations, :props, :pages, :category,
             :dimension_ids, :completed_assessments, :data_configuration, :data_sheet_columns, :relationships,
             :innovation_styles, :result_completed_at, :norm_used, :result_locale, :default_language, :other_languages,
             :locales, :module_overrides, :assessments, :styles, :flip_content, :available_languages

  has_many :filters, each_serializer: Reports::FilterSerializer
  has_many :campaign_factors, each_serializer: Reports::CampaignFactorSerializer
  has_many :campaign_ai_artifacts, each_serializer: Reports::CampaignAIArtifactSerializer

  def assessments
    Panko::ArraySerializer.new(
      object.assessments,
      each_serializer: Reports::AssessmentSerializer,
      context: {
        piped_text_context: context[:piped_text_context],
        locale: current_lang,
        campaign_user: context[:campaign_user]
      }
    ).to_a
  end

  def pages
    Panko::ArraySerializer.new(
      object.pages,
      each_serializer: Reports::PageSerializer,
      context: {
        piped_text_context: context[:piped_text_context],
        builder: context[:builder],
        user_results_hash: user_results_hash
      }
    ).to_a
  end

  def default_language
    {
      code: locale, name: I18n.t("languages.#{locale}"),
      direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
    }
  end

  def available_languages
    other_languages = context[:available_languages] || object.other_languages

    (other_languages + [locale]).uniq.map do |language|
      {
        code: language, name: I18n.t("languages.#{language}"),
        direction: Settings.rtl_languages.include?(language) ? 'rtl' : 'ltr'
      }
    end
  end

  def locales
    Reports::GetTranslationWithPipetextReplaced.call!(
      object,
      piped_text_context: context[:piped_text_context],
      locale: current_lang
    )
  end

  def locale
    context[:default_language] || object.default_language || I18n.default_locale
  end

  def flip_content
    Settings.rtl_languages.include?(object.default_language) != Settings.rtl_languages.include?(current_lang)
  end

  def factors
    object_assessment_ids = object.assessment_ids
    factors = Factor.where(dimension_id: object.dimension_ids).
              includes({ factors_sub_factors: { sub_factor: :translations } }, :translations,
                       icon_attachment: :blob, skill: :job_roles).
              order(name: :asc)

    question_ids = FactorsScoring.factor_question_ids(object_assessment_ids)

    aliases = FactorsAlias.where(factor_id: factors.ids, report_id: object.id).group_by(&:factor_id)
    factors.group_by(&:dimension_id).transform_values do |group|
      Panko::ArraySerializer.new(
        group,
        each_serializer: ::Factors::WithSubFactorsSerializer,
        context: {
          question_ids: question_ids,
          report_id: object.id,
          alias: aliases,
          campaign_user: context[:campaign_user]
        }
      ).to_a
    end
  end

  def occupations
    occupations = Occupation.includes(:occupations_factors).
                  where(dimension_id: object.assessments.pluck(:dimension_id)).
                  order(name: :asc)
    occupations.includes(
      icon_attachment: :blob,
      alternative_icon_attachment: :blob,
      indicative_roles_image_attachment: :blob,
      key_career_tracks_image_attachment: :blob
    ).group_by(&:dimension_id).transform_values do |group|
      Panko::ArraySerializer.new(
        group,
        each_serializer: OccupationSerializer
      ).to_a
    end
  end

  def innovation_styles
    innovation_styles = InnovationStyle.includes(:innovation_styles_factors, icon_attachment: :blob).
                        where(dimension_id: object.assessments.pluck(:dimension_id)).
                        order(name: :asc)
    innovation_styles.group_by(&:dimension_id).transform_values do |group|
      Panko::ArraySerializer.new(
        group,
        each_serializer: InnovationStyleSerializer
      ).to_a
    end
  end

  # Used for Piped Text
  def result_completed_at
    return if results.blank?

    from, to = Reports::CompletedAtDates.call!(results)
    return '' unless from

    format = I18n.t('time.formats.short_date')
    from == to ? from.strftime(format) : "#{from.strftime(format)} - #{to.strftime(format)}"
  end

  # Used for Piped Text
  def norm_used
    norms = Norm.where(id: results.filter_map(&:norm_id)).index_by(&:id)

    results.each_with_object({}) do |result, acc|
      next unless result.norm_id

      acc[result.assessment_id] = norms[result.norm_id]&.decorate&.display_name
    end
  end

  # Used for Piped Text
  def result_locale
    results.each_with_object({}) do |result, acc|
      locale = result.user_assessment.selected_locale || I18n.default_locale

      acc[result.assessment_id] = I18n.t("languages.#{locale}")
    end
  end

  def factor_norms
    norms = Norm.includes(:factors_norms).where(dimension_id: object.assessments.pluck(:dimension_id)).distinct
    norms.each_with_object({}) do |norm, hash|
      hash[norm.id] = norm.factors_norms.group_by(&:type)
    end
  end

  delegate :dimension_ids, to: :object

  def completed_assessments
    object.assessment_ids
  end

  def data_sheet_columns
    return object.data_sheet_columns unless object.category_threesixty?
    return {} unless connected_campaign

    connected_campaign.datasheet_columns
  end

  # Returns YAML rules for exporting data.
  #
  delegate :data_configuration, to: :object

  def relationships
    if connected_campaign && object.category_threesixty?
      Panko::ArraySerializer.new(
        Relationships::ByCampaign.new(connected_campaign),
        each_serializer: RelationshipSerializer
      ).to_a
    else
      non_threesixty_relationships
    end
  end

  def connected_campaign
    Campaign.joins(:threesixty_campaign).find_by(threesixty_campaigns: { report_id: object.id })
  end

  def non_threesixty_relationships
    [
      { id: 'Self', name: 'Self' },
      { id: 'Manager', name: 'Direct Manager' },
      { id: 'Peer', name: 'Peer' },
      { id: 'DirectReport', name: 'Direct Report' }
    ]
  end

  def module_overrides
    Panko::ArraySerializer.new(
      context[:module_overrides],
      each_serializer: TextModuleOverrideSerializer
    ).to_a
  end

  private

  def user_results_hash
    return {} if results.blank?

    results.includes(:user_assessment, :assessment).index_by do |result|
      [result.user_assessment.assessment_id, result.user_assessment.subject_id]
    end
  end

  def current_lang
    context[:lang] || locale
  end

  def results
    user_results || []
  end

  def user_results
    context[:user_results]
  end

  def campaign
    context&.dig(:campaign)
  end
end
