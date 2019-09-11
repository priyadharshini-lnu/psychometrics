# frozen_string_literal: true

module Api
  module V1
    class ResultSerializer < ActiveModel::Serializer
      attributes :user_data, :assessments

      def initialize(object, instance_options = {})
        super(object, instance_options)
        @assessments = {}
      end

      def user_data
        user_data = object.select { |row| row.dig(:config_data, 'type') == 'user_data' }
        user_data.each_with_object({}) { |row, result| result[row[:key]] = row[:value] }
      end

      def assessments
        assessment_ids = object.map { |row| row.dig(:config_data, 'assessmentId') }.compact.uniq
        assessments = Assessment.where(id: assessment_ids).all
        assessments.map do |assessment|
          Api::V1::Results::AssessmentSerializer.new(assessment, rows: object).to_h
        end
      end
    end
  end
end
