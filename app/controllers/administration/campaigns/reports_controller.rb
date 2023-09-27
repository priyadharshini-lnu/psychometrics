# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportsController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[destroy toggle_user_access toggle_assessor_access toggle_user_dashboard]

      def create
        form = ::Campaigns::Reports::Form.from_params(resource_params)
        if form.valid?
          ::Campaigns::Reports::Add.call(form, campaign, current_user) do
            on(:ok) do
              return assessments_and_reports
            end
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        remove_user_reports = current_user.is?(:superadmin) && params[:remove_user_reports]
        ::CampaignReports::Remove.call!(
          campaign_report: resource, remove_user_reports: remove_user_reports
        )
        audit! :delete, resource, campaign: campaign, payload: resource.log_attributes.merge(
          remove_user_reports: remove_user_reports
        )
        render json: resource.id
      end

      def toggle_user_access
        ::CampaignReports::ToggleUserAccess.call!(resource, params[:toggle_user_access])
        render json: resource, serializer: Administration::CampaignReportSerializer, campaign_id: campaign.id,
               project_id: campaign.project_id
        audit! :toggle_user_access, resource, campaign: campaign
      end

      def toggle_assessor_access
        resource.toggle!(:assessor_access)
        audit! :toggle_assessor_access, resource, payload: { assessor_access: resource.assessor_access },
          campaign: campaign
        head :ok
      end

      def toggle_user_dashboard
        ActiveRecord::Base.transaction do
          campaign.campaign_reports.where.not(id: resource.id).update_all(user_dashboard: false)
          resource.toggle!(:user_dashboard)
          audit! :toggle_user_dashboard, resource, payload: { user_dashboard: resource.user_dashboard },
            campaign: campaign
        end
        render json: resource, serializer: Administration::CampaignReportSerializer, campaign_id: campaign.id,
               project_id: campaign.project_id
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
            :norm, assessment: %i[norms linked_assessment]
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
          assessments: assessments,
          reports: reports,
          assessor_assessments: assessor_assessments,
          permissions: {
            assessment_permissions: aseessment_permissions,
            report_permissions: report_permissions
          }
        }
      end

      def other
        excluded_report_ids = campaign.campaign_reports.map(&:report_id)
        user_reports = campaign.user_reports.where.not(report_id: excluded_report_ids).
                       preload(:report).
                       select(:report_id).
                       distinct(:report_id).
                       order(report_id: :desc)
        list = ActiveModelSerializers::SerializableResource.new(
          user_reports.page(params[:page]).per(params[:size]).map(&:report),
          each_serializer: Campaigns::OtherReportSerializer,
          current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
        )

        render json: {
          list: list,
          total: user_reports.count
        }
      end

      def report_families
        report_families = campaign.client.
                          report_families.
                          eager_load(:reports).
                          merge(Report.assignable).
                          references(:reports).
                          distinct.
                          sort_by { |r| r[:name] }
        render json: report_families,
               each_serializer: Administration::ReportFamilySerializer
      end

      def regenerate
        AdminJob.call(:bulk_regenerate_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)
        audit! :regenerate, nil, payload: { ids: params[:ids] }, campaign: campaign

        head :ok
      end

      def bulk_download
        AdminJob.call(:bulk_download_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)
        audit! :bulk_download, nil, payload: { ids: params[:ids] }, campaign: campaign

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

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.campaign_reports.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName

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
          ::Administration::CampaignReportPolicy,
          current_user,
          nil,
          [
            %w[add_report report_families],
            'bulk_download',
            'regenerate',
            'toggle_user_access',
            'toggle_assessor_access',
            'toggle_user_dashboard'
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
