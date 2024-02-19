# frozen_string_literal: true

module Assessments
  class AssessmentSerializer < Panko::Serializer
    attributes :id, :name, :category, :disabled, :created_at,
               :flow, :norm_rules, :factors, :enable_back, :enable_progress, :question_recoding,
               :data_sheet_columns, :relationships, :extra, :resources, :resources_data, :options,
               :instructions, :default_norm_id, :owner_id, :linked_questions, :blocks

    has_one :linked_assessment, serializer: Assessments::LinkedAssessmentSerializer

    def blocks
      blocks = object.blocks.
               selecting do
                 ['blocks.*',
                  coalesce(template.props, props).as('props'),
                  coalesce(template.name, name).as('name')]
               end.
               joining { template.outer }.
               includes(questions_ams: :comments).
               where.has { (template.disabled == false) | (template.id == nil) }

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: Assessments::BlockSerializer
      ).to_a
    end

    def factors
      factors_scoring = object.factors_scoring.group_by(&:factor_id)
      object.dimension.all_factors.map do |factor|
        Assessments::FactorSerializer.new(
          context: {
            assessment_id: object.id, factors_scoring: factors_scoring[factor.id] || []
          }
        ).serialize(factor)
      end
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

      ids = object.resources.map { |r| r['assessmentId'] }
      Question.where(assessment_id: ids, type: 'StaticContent').group_by(&:assessment_id)
    end
  end
end
