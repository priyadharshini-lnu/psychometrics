# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[destroy toggle_user_access]

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

      def destroy
        ::CampaignReports::Remove.call!(
          campaign_report: resource, remove_user_reports: params[:remove_user_reports]
        )
        render json: resource.id
      end

      def toggle_user_access
        ::CampaignReports::ToggleUserAccess.call!(resource, params[:toggle_user_access])
        render json: resource, serializer: Administration::CampaignReportSerializer
      end

      def export
        report = Report.find(params[:id])
        campaign = Campaign.find(params[:new_campaign_id])
        xlsx = ::Reports::ExportData.call!(report, campaign)

        respond_to do |format|
          format.xlsx { send_data xlsx.to_stream.read, filename: "report-#{report.id}-data.xlsx" }
        end
      end

      def assessments_and_reports
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign.campaign_reports.includes(:report),
          each_serializer: Administration::CampaignReportSerializer
        )
        assessments = ActiveModelSerializers::SerializableResource.new(
          campaign.campaign_assessments.includes(:norm, assessment: [:reports]),
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

      def regenerate
        campaign_reports = campaign.campaign_reports.where(id: params[:ids]).to_a
        ::CampaignReports::GenerateAndSavePdfJob.perform_later(campaign_reports, current_user)

        head :ok
      end

      def bulk_download
        campaign_reports = campaign.campaign_reports.where(id: params[:ids]).to_a
        ::CampaignReports::BulkDownloadJob.perform_later(campaign_reports, current_user)

        head :ok
      end

      private

      def resource_class
        CampaignReport
      end
    end
  end
end
