# frozen_string_literal: true

# == Schema Information
#
# Table name: reports
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  type          :integer          default("common")
#

class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at, :filters, :factors, :factor_norms, :occupations, :props,
             :dimension_ids, :completed_assessments, :data_configuration, :data_sheet_columns, :relationships,
             :category, :pages, :innovation_styles, :result_completed_at, :norm_used, :result_locale, :default_language,
             :locales

  has_many :filters, serializer: Reports::FilterSerializer
  has_many :assessments, serializer: Reports::AssessmentSerializer

  def pages
    object.pages.map do |page|
      Reports::PageSerializer.new(page, piped_text_context: @instance_options[:piped_text_context])
    end
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
    factors.group_by(&:dimension_id).transform_values do |group|
      group.map do |obj|
        ::Factors::WithSubFactorsSerializer.new(obj, assessment_id: object_assessment_ids,
                                                        report_id: object.id,
                                                        alias: aliases[obj.id]&.first)
      end
    end
  end

  def occupations
    occupations = Occupation.includes(:occupations_factors).
                  where(dimension_id: object.assessments.pluck(:dimension_id)).
                  order(name: :asc)
    occupations.group_by(&:dimension_id).transform_values do |group|
      group.map { |occupation| OccupationSerializer.new(occupation) }
    end
  end

  def innovation_styles
    innovation_styles = InnovationStyle.includes(:innovation_styles_factors).
                        where(dimension_id: object.assessments.pluck(:dimension_id)).
                        order(name: :asc)
    innovation_styles.group_by(&:dimension_id).transform_values do |group|
      group.map { |innovation_style| InnovationStyleSerializer.new(innovation_style) }
    end
  end

  # Used for Piped Text
  def result_completed_at
    return if assigns.blank?

    dates = assigns.map do |assign|
      assign&.completed_at&.to_date
    end.compact.sort

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
    norm_data = assigns.pluck(:norm_data).compact
    return if norm_data.blank?

    norms = Norm.where(id: norm_data.map { |data| data.dig('id') }.compact)
    norms.map do |norm|
      norm&.decorate&.display_name
    end
  end

  # Used for Piped Text
  def result_locale
    assigns.map do |assign|
      locale = assign.selected_locale || I18n.default_locale
      I18n.t("languages.#{locale}")
    end.uniq
  end

  def assigns
    return [] unless @instance_options[:membership]

    @assigns ||= Assign.includes(:membership).joins(:membership).
                 where(assessment_id: object.assessment_ids,
                        memberships: {
                          client_id: @instance_options[:membership].client_id,
                          user_id: @instance_options[:membership].user_id
                        })
  end

  def factor_norms
    norms = Norm.includes(:factors_norms).where(dimension_id: object.assessments.pluck(:dimension_id)).distinct
    norms.each_with_object({}) do |norm, hash|
      hash[norm.id] = norm.factors_norms.group_by(&:type)
    end
  end

  def dimension_ids
    object.dimension_ids
  end

  def completed_assessments
    object.assessment_ids
  end

  def data_sheet_columns
    return object.data_sheet_columns unless object.category_threesixty?

    Datasheet.find_by(project_id: connected_campaign.project_id)&.normalize_columns || []
  end

  # Returns YAML rules for exporting data.
  #
  def data_configuration
    object.data_configuration.to_yaml
  end

  def relationships
    if object.category_threesixty?
      Relationships::ByCampaign.new(connected_campaign).map { |r| RelationshipSerializer.new(r).to_h }
    else
      non_threesixty_relationships
    end
  end

  def connected_campaign
    @connected_campaign ||= Campaign.joins(:threesixty_campaign).find_by(threesixty_campaigns: { report_id: object.id })
  end

  def non_threesixty_relationships
    [
      { id: 'Self', name: 'Self' },
      { id: 'Manager', name: 'Direct Manager' },
      { id: 'Peer', name: 'Peer' },
      { id: 'DirectReport', name: 'Direct Report' }
    ]
  end
end
