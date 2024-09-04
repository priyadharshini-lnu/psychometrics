# frozen_string_literal: true

class ReportSerializer < Panko::Serializer
  attributes :id, :name, :disabled, :created_at, :factors, :factor_norms, :occupations, :props,
             :dimension_ids, :completed_assessments, :data_configuration, :data_sheet_columns, :relationships,
             :category, :pages, :innovation_styles, :result_completed_at, :norm_used, :result_locale, :default_language,
             :locales, :campaign_factors, :module_overrides, :assessments, :styles

  has_many :filters, each_serializer: Reports::FilterSerializer

  def assessments
    Panko::ArraySerializer.new(
      object.assessments,
      each_serializer: Reports::AssessmentSerializer,
      context: {
        piped_text_context: context[:piped_text_context]
      }
    ).to_a
  end

  def pages
    Panko::ArraySerializer.new(
      object.pages,
      each_serializer: Reports::PageSerializer,
      context: {
        piped_text_context: context[:piped_text_context],
        builder: context[:builder]
      }
    ).to_a
  end

  def default_language
    {
      code: locale,
      name: I18n.t("languages.#{locale}"),
      direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
    }
  end

  def locales
    Translation.to_hash_for_report(object.id, object.assessment_ids, locale)
  end

  def locale
    object.default_language || I18n.default_locale
  end

  def factors
    object_assessment_ids = object.assessment_ids
    factors = Factor.
              selecting do
      ['factors.*',
       array(
         _(
           FactorsScoring.
             select(:question_id).
             where.has { |fs| fs.factor_id.eq(id) & fs.assessment_id.eq(object_assessment_ids) }.
             where('json_array_length(props) > 0')
         )
       ).as('question_ids')]
    end.
              where(dimension_id: object.dimension_ids).
              includes(:sub_factors).
              order(name: :asc)
    aliases = FactorsAlias.where(factor_id: factors.ids, report_id: object.id).group_by(&:factor_id)
    factors.with_attached_icon.group_by(&:dimension_id).transform_values do |group|
      Panko::ArraySerializer.new(
        group,
        each_serializer: ::Factors::WithSubFactorsSerializer,
        context: {
          assessment_id: object_assessment_ids,
          report_id: object.id,
          alias: aliases
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
    innovation_styles = InnovationStyle.includes(:innovation_styles_factors).
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

    dates = results.filter_map do |result|
      result&.completed_at&.to_date
    end.sort

    return '' if dates.empty?

    if dates.first == dates.last
      dates.first.strftime(I18n.t('time.formats.short_date'))
    else
      "#{dates.first.strftime(I18n.t('time.formats.short_date'))} - #{dates.last.strftime(I18n.t(
                                                                                            'time.formats.short_date'
                                                                                          ))}"
    end
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

  def assigns
    return [] unless context[:membership]

    Assign.includes(:membership).joins(:membership).
      where(assessment_id: object.assessment_ids,
            memberships: {
              client_id: context[:membership].client_id,
              user_id: context[:membership].user_id
            })
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

  def results
    user_results || assigns
  end

  def user_results
    context[:user_results]
  end
end
