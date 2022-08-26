# frozen_string_literal: true

module Api
  module V1
    class ResultSerializer < ActiveModel::Serializer
      attributes :user_data, :assessments, :computed_scores, :campaign_id

      def initialize(object, instance_options = {})
        super(object, instance_options)
        @assessments = {}
      end

      def user_data
        user_data = object.select do |row|
          row.dig(:config_data, 'type') == 'user_data' ||
            (row.dig(:config_data, 'type') == 'datasheet' && row.dig(:config_data, 'category') == 'user_data')
        end
        user_data.each_with_object({}) { |row, result| result[row[:key]] = row[:value] }
      end

      def campaign_id
        instance_options[:user_report]&.campaign_id
      end

      def assessments
        assessment_ids = object.filter_map { |row| row.dig(:config_data, 'assessmentId') }.uniq
        assessments = Assessment.where(id: assessment_ids).all
        assessments.map do |assessment|
          Api::V1::Results::AssessmentSerializer.new(assessment, rows: object).to_h
        end
      end

      def computed_scores
        scores = object.reject do |row|
          row.dig(:config_data, 'assessmentId').present? ||
            row.dig(:config_data, 'type') == 'user_data' ||
            (row.dig(:config_data, 'type') == 'datasheet' && row.dig(:config_data, 'category') != 'computed_scores')
        end
        scores.map do |score|
          Api::V1::Results::ComputedScoreSerializer.new(score).to_h
        end
      end
    end
  end
end
