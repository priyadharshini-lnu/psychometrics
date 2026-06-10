# frozen_string_literal: true

module Assessments
  class AssessmentSerializer < Panko::Serializer
    attributes :id, :name, :category, :disabled, :created_at,
               :flow, :norm_rules, :factors, :enable_back, :enable_progress, :question_recoding,
               :data_sheet_columns, :relationships, :extra, :resources, :resources_data, :options,
               :instructions, :default_norm_id, :owner_id, :linked_questions, :blocks, :default_language,
               :campaign_factors_list, :locale, :available_translations, :translations_migrated

    has_one :linked_assessment, serializer: Assessments::LinkedAssessmentSerializer

    def blocks
      template_table = Block.arel_table.alias('templates_blocks')
      blocks_table = Block.arel_table

      coalesce_props = Arel::Nodes::NamedFunction.new('COALESCE',
                                                      [template_table[:props], blocks_table[:props]]).as('props')
      coalesce_name = Arel::Nodes::NamedFunction.new('COALESCE',
                                                     [template_table[:name], blocks_table[:name]]).as('name')

      template_not_disabled = template_table[:disabled].eq(false)
      template_not_present = template_table[:id].eq(nil)

      blocks = object.blocks.
               left_outer_joins(:template).
               select('blocks.*', coalesce_props, coalesce_name).
               includes(:questions_ams).
               where(template_not_disabled.or(template_not_present))

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: Assessments::BlockSerializer,
        context: {
          locale: context[:locale],
          default_language: default_language,
          translations_migrated: object.translations_migrated?,
          translations: translations
        }
      ).to_a
    end

    def factors
      factors_scoring = object.factors_scoring.group_by(&:factor_id)

      Panko::ArraySerializer.new(
        object.dimension.all_factors.includes(:translations).with_attached_icon,
        each_serializer: Assessments::FactorSerializer,
        context: {
          factors_scoring: factors_scoring
        }
      ).to_a
    end

    def name
      object.name || object.read_attribute(:name)
    end

    def question_recoding
      QuestionRecoding.where(assessment: object)
    end

    def data_sheet_columns
      return object.data_sheet_columns if object.data_sheet_columns.present?
      return [] if !object.threesixty? || connected_campaign.nil?

      connected_campaign.datasheet_columns
    end

    def relationships
      return [] if !object.threesixty? || connected_campaign.nil?

      Panko::ArraySerializer.new(
        Relationships::ByCampaign.new(connected_campaign),
        each_serializer: RelationshipSerializer
      ).to_a
    end

    def connected_campaign
      Campaign.
        joins(:threesixty_campaign).find_by(threesixty_campaigns: { assessment_id: object.id })
    end

    def resources_data
      return {} unless object.resources

      ids = object.resources.pluck('assessmentId')
      Question.where(assessment_id: ids, type: 'StaticContent').group_by(&:assessment_id)
    end

    def instructions
      return object.instructions if default_language?

      return object.instructions unless object.translations_migrated?

      instructions = object.instructions
      translated_content = translations.dig('instructions', 0, 'props', 'content')
      instructions['content'] = translated_content if translated_content

      instructions
    end

    def locale
      context[:locale]
    end

    def available_translations
      @available_translations = ::Translation.available_translation_for_assessment(id)
    end

    def translations_migrated
      object.translations_migrated?
    end

    private

    def default_language?
      default_language == context[:locale]
    end

    def translations
      @translations = ::Translation.to_hash_for_assessment(id, locale,
                                                           translations_migrated: object.translations_migrated?)
    end
  end
end
