# frozen_string_literal: true

module Assessments
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at,
               :flow, :norm_rules, :factors, :enable_back, :enable_progress, :question_recoding,
               :data_sheet_columns, :relationships, :extra, :resources, :resources_data, :options,
               :instructions, :default_norm_id, :owner_id, :linked_questions

    has_many :blocks, serializer: Assessments::BlockSerializer do
      object.blocks.
        selecting do
        ['blocks.*',
         coalesce(template.props, props).as('props'),
         coalesce(template.name, name).as('name')]
      end.
        joining { template.outer }.
        includes(questions_ams: :comments).
        where.has { (template.disabled == false) | (template.id == nil) }
    end

    has_one :linked_assessment, serializer: Assessments::LinkedAssessmentSerializer

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
      return object.data_sheet_columns if object.data_sheet_columns.present?
      return [] if !object.threesixty? || connected_campaign.nil?

      connected_campaign.datasheet_columns
    end

    def relationships
      return [] if !object.threesixty? || connected_campaign.nil?

      Relationships::ByCampaign.new(connected_campaign).map { |r| RelationshipSerializer.new(r).to_h }
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
