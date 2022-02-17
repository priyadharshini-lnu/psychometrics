# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[destroy toggle_user_access toggle_assessor_access]

      def create
        form = ::Campaigns::Reports::Form.from_params(resource_params)
        if form.valid?
          ::Campaigns::Reports::Add.call(form, campaign) do
            on(:ok) do
              audit! :create_report, campaign, campaign: campaign, payload: resource_params
              return assessments_and_reports
            end
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
        render json: resource, serializer: Administration::CampaignReportSerializer, campaign_id: campaign.id,
          project_id: campaign.project_id
      end

      def toggle_assessor_access
        resource.toggle!(:assessor_access)

        head :ok
      end

      def export
        AdminJob.call(:export_report_data, { report_id: params[:id], campaign_id: campaign.id }, current_user)

        head :ok
      end

      def assessments_and_reports
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign.campaign_reports.includes(:report, :report_family),
          each_serializer: Administration::CampaignReportSerializer,
          current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
        )
        assessments = ActiveModelSerializers::SerializableResource.new(
          campaign.campaign_assessments.includes(
            :norm, :assessor_form, assessment: %i[pearson_assessment_setting saville_assessment_setting norms]
          ),
          each_serializer: Administration::CampaignAssessmentSerializer,
          current_user: current_user, project_id: campaign.project_id,
          campaign_id: campaign.id
        )
        assessor_assessments = ActiveModelSerializers::SerializableResource.new(
          campaign.assessor_assessments,
          each_serializer: Administration::AssessorAssessmentSerializer,
          current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
        )

        render json: {
          assessments: assessments, reports: reports, assessor_assessments: assessor_assessments,
          permissions: {
            assessment_permissions: aseessment_permissions,
            report_permissions: report_permissions
          }
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

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def aseessment_permissions
        GetPermissionsHash.call!(
          Administration::CampaignAssessmentPolicy,
          current_user,
          nil,
          %w[
            enable_universal_link
            update_norm
            update_assessor_form
            update_available_locales
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def report_permissions
        GetPermissionsHash.call!(
          Administration::CampaignReportPolicy,
          current_user,
          nil,
          [
            %w[add_report report_families],
            'bulk_download',
            'regenerate',
            'toggle_user_access',
            'toggle_assessor_access'
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def resource_class
        CampaignReport
      end
    end
  end
end
