# frozen_string_literal: true

module Api
  module V1
    class UserReportSerializer < Panko::Serializer
      attributes :id, :name, :description, :icon_url, :poster_url, :status, :assessments, :campaign_id, :output_type,
                 :user_access

      delegate :id, :name, :description, to: :report

      def output_type
        {
          pdf: !report.modules_empty?,
          results: report.data_configuration.present?
        }
      end

      def icon_url
        report.icon.url
      end

      def poster_url
        report.poster.url
      end

      def status
        object.decorate.api_status
      end

      def assessments
        object.report.assessment_ids.filter_map do |id|
          user_assessment = context[:user_assessments][id]
          user_assessment ? Api::V1::UserAssessmentSerializer.new.serialize(user_assessment) : nil
        end
      end

      private

      def report
        object.report
      end
    end
  end
end
