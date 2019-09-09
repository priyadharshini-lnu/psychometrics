# frozen_string_literal: true

module Assessments
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at,
               :flow, :norm_rules, :factors, :enable_back, :enable_progress, :question_recoding,
               :data_sheet_columns, :relationships

    has_many :blocks, serializer: Assessments::BlockSerializer do
      object.blocks.
        selecting do
        ['blocks.*',
         coalesce(template.props, props).as('props'),
         coalesce(template.name, name).as('name')]
      end .
        joining { template.outer }.
        includes(questions_ams: :comments).
        where.has { (template.disabled == false) | (template.id == [nil]) }
    end

    def factors
      factors_scoring = object.factors_scoring.group_by(&:factor_id)
      object.dimension.all_factors.map do |factor|
        Assessments::FactorSerializer.
          new(factor, assessment_id: object.id, factors_scoring: factors_scoring[factor.id] || []).to_hash
      end
    end

    def question_recoding
      QuestionRecoding.where(assessment: object)
    end

    def data_sheet_columns
      return [] unless object.threesixty?

      Datasheet.find_by(project_id: connected_campaign.project_id)&.normalize_columns || []
    end

    def relationships
      return [] unless object.threesixty?

      Relationships::ByCampaign.new(connected_campaign).map { |r| RelationshipSerializer.new(r).to_h }
    end

    def connected_campaign
      @connected_campaign ||= Campaign.
                              joins(:threesixty_campaign).find_by(threesixty_campaigns: { assessment_id: object.id })
    end
  end
end
