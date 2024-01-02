# frozen_string_literal: true

module Api
  module V1
    class CampaignAssessmentsAndReportsSerializer < Panko::Serializer
      attributes :reports, :assessments

      def reports
        object.campaign_reports.map do |cr|
          {
            id: cr.report_id,
            report_bundle_id: cr.report_family_id,
            user_access: cr.user_access
          }
        end
      end

      def assessments
        object.campaign_assessments.map do |ca|
          {
            id: ca.assessment_id,
            norm_id: ca.norm_id
          }
        end
      end
    end
  end
end
