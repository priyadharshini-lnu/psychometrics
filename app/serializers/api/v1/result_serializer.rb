# frozen_string_literal: true

module Api
  module V1
    class ResultSerializer < Panko::Serializer
      attributes :user_data, :assessments, :computed_scores, :campaign_id

      def initialize(object)
        super
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
        context[:user_report]&.campaign_id
      end

      def assessments
        assessment_ids = object.filter_map { |row| row.dig(:config_data, 'assessmentId') }.uniq
        assessments = Assessment.where(id: assessment_ids).all
        Panko::ArraySerializer.new(
          assessments,
          each_serializer: Api::V1::Results::AssessmentSerializer,
          context: {
            rows: object
          }
        ).to_a
      end

      def computed_scores
        scores = object.reject do |row|
          row.dig(:config_data, 'assessmentId').present? ||
            row.dig(:config_data, 'type') == 'user_data' ||
            (row.dig(:config_data, 'type') == 'datasheet' && row.dig(:config_data, 'category') != 'computed_scores')
        end
        Panko::ArraySerializer.new(
          scores,
          each_serializer: Api::V1::Results::ComputedScoreSerializer
        ).to_a
      end
    end
  end
end
