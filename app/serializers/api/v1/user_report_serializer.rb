# frozen_string_literal: true

module Api
  module V1
    class UserReportSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :assessments, :campaign_id

      def status
        object.decorate.api_status
      end

      def id
        object.report.id
      end

      def name
        object.report.name
      end

      def assessments
        object.report.assessment_ids.map do |id|
          user_assessment = instance_options[:user_assessments][id]
          user_assessment ? Api::V1::UserAssessmentSerializer.new(user_assessment).to_h : nil
        end.compact
      end
    end
  end
end
