# frozen_string_literal: true

module Api
  module V1
    class UserAssessmentsAndReportsSerializer < Panko::Serializer
      attributes :reports, :assessments

      def reports
        object.user_reports.map do |ur|
          {
            id: ur.report_id,
            report_bundle_id: ur.report_family_id,
            user_access: ur.user_access
          }
        end
      end

      def assessments
        object.user_assessments.map do |ua|
          {
            id: ua.assessment_id,
            norm_id: ua.norm_id
          }
        end
      end
    end
  end
end
