# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportsController < Administration::Projects::BaseController
      def create
        form = ::Campaigns::Reports::Form.from_params(resource_params)
        if form.valid?
          ::Campaigns::Reports::Add.call(form, campaign) do
            on(:ok) { return assessments_and_reports }
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def assessments_and_reports
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign.campaigns_reports.includes(:report),
          each_serializer: Administration::CampaignReportSerializer
        )
        assessments = ActiveModelSerializers::SerializableResource.new(
          campaign.campaigns_assessments.includes(:assessment, :norm),
          each_serializer: Administration::CampaignAssessmentSerializer
        )

        render json: { assessments: assessments, reports: reports }
      end

      def report_families
        report_families = campaign.client.
                          report_families.
                          includes(:reports).
                          where(reports: { disabled: false }).
                          references(:reports).
                          distinct
        render json: report_families,
          each_serializer: Administration::ReportFamilySerializer
      end

      private

      def resource_class
        CampaignsReport
      end
    end
  end
end
