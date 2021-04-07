# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[destroy toggle_user_access toggle_assessor_access]

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

      def toggle_assessor_access
        resource.toggle!(:assessor_access)

        head :ok
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
          campaign.campaign_assessments.includes(:norm, :assessment),
          each_serializer: Administration::CampaignAssessmentSerializer, current_user: current_user
        )

        assessor_assessments = ActiveModelSerializers::SerializableResource.new(
          campaign.assessor_assessments,
          each_serializer: Administration::AssessorAssessmentSerializer, current_user: current_user
        )

        render json: {
          assessments: assessments, reports: reports, assessor_assessments: assessor_assessments,
          permissions: { assessment_permissions: aseessment_permissions }
        }
      end

      def report_families
        report_families = campaign.client.
                          report_families.
                          eager_load(:reports).
                          merge(Report.assignable).
                          references(:reports).
                          distinct
        render json: report_families,
          each_serializer: Administration::ReportFamilySerializer
      end

      def regenerate
        AdminJob.call(:bulk_regenerate_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)

        head :ok
      end

      def bulk_download
        AdminJob.call(:bulk_download_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)

        head :ok
      end

      private

      def aseessment_permissions
        GetPermissionsHash.call!(
          Administration::CampaignAssessmentPolicy,
          current_user,
          nil,
          %w[
            enable_universal_link
          ]
        )
      end

      def resource_class
        CampaignReport
      end
    end
  end
end
