# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Administration
  module Campaigns
    class ReportsController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[destroy toggle_user_access toggle_assessor_access toggle_user_dashboard
                                            toggle_main_report toggle_auto_assign update_default_and_available_locales
                                            get_bulk_assets_zip_presigned_upload_url attach_bulk_asset_csv_and_zip
                                            get_bulk_assets_csv_presigned_upload_url]

      def create
        audit! :create, resource, payload: resource_params, campaign: campaign

        form = ::Campaigns::Reports::Form.from_params(resource_params)
        if form.valid? && form.skip_existing?
          ::Campaigns::Reports::Add.call(form, campaign, current_user) do
            on(:ok) do
              return assessments_and_reports
            end
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        elsif form.valid?
          AdminJob.call(:add_campaign_reports, { resource_params: resource_params, campaign_id: campaign.id },
                        current_user)

          assessments_and_reports
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
        render json: ::Administration::CampaignReportSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(resource)
        audit! :toggle_user_access, resource, campaign: campaign
      end

      def toggle_assessor_access
        resource.toggle!(:assessor_access)
        audit! :toggle_assessor_access, resource, payload: { assessor_access: resource.assessor_access },
          campaign: campaign
        head :ok
      end

      def toggle_auto_assign
        resource.toggle!(:auto_assign)
        audit! :toggle_auto_assign, resource, payload: { auto_assign: resource.auto_assign },
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
        render json: ::Administration::CampaignReportSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(resource)
      end

      def toggle_main_report
        ActiveRecord::Base.transaction do
          campaign.campaign_reports.where.not(id: resource.id).update_all(main_report: false)
          resource.update(main_report: params[:main_report])
          audit! :toggle_main_report, resource, payload: { main_report: params[:main_report] }, campaign: campaign
        end
        render json: ::Administration::CampaignReportSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(resource)
      end

      def update_default_and_available_locales
        resource.update!(
          default_language: params[:default_language],
          available_languages: params[:available_languages] || []
        )

        render json: {
          default_language: resource.default_language,
          available_languages: resource.available_languages
        }
      end

      def export
        AdminJob.call(:export_report_data, { report_id: params[:id], campaign_id: campaign.id }, current_user)

        head :ok
      end

      def get_bulk_assets_zip_presigned_upload_url
        resource.bulk_assets_zip.purge if resource.bulk_assets_zip.attached?
        result = ObjectStorage::GetSingleSignedUploadUrl.call!(
          model: resource, field: :bulk_assets_zip, file_name: params[:blob][:filename], blob_params: params[:blob]
        )
        render json: result
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def get_bulk_assets_csv_presigned_upload_url
        resource.bulk_assets_csv.purge if resource.bulk_assets_csv.attached?
        result = ObjectStorage::GetSingleSignedUploadUrl.call!(
          model: resource, field: :bulk_assets_csv, file_name: params[:blob][:filename], blob_params: params[:blob]
        )
        render json: result
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def attach_bulk_asset_csv_and_zip
        resource.bulk_assets_zip = params[:zip_signed_id]
        resource.bulk_assets_csv = params[:csv_signed_id]
        if resource.save
          AdminJob.call(
            :campaign_report_extract_and_upload_bulk_assets,
            { campaign_report_id: params[:id] }, current_user
          )
          render json: :ok
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def assessments_and_reports
        reports = Panko::ArraySerializer.new(
          campaign.campaign_reports.includes(:report, :report_family),
          each_serializer: Administration::CampaignReportSerializer,
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).to_a

        assessments = Panko::ArraySerializer.new(
          campaign.campaign_assessments.includes(
            :norm, :mettl_schedule_record,
            assessment: [:norms, :linked_assessment, :linked_assessor_form, :translations,
                         { dimension: :occupation_condition_sets }]
          ),
          each_serializer: Administration::CampaignAssessmentSerializer,
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).to_a

        assessor_assessments = Panko::ArraySerializer.new(
          campaign.assessor_assessments,
          each_serializer: Administration::AssessorAssessmentSerializer,
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).to_a

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
        list = Panko::ArraySerializer.new(
          user_reports.page(params[:page]).per(params[:size]).map(&:report),
          each_serializer: Campaigns::OtherReportSerializer,
          context: {
            current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
          }
        ).to_a

        render json: {
          list: list,
          total: user_reports.count
        }
      end

      def report_families
        project = Campaign.find(params[:new_campaign_id]).project

        report_families = License.where(id: client.usable_license_id(project)).
                          includes(:report_family).
                          filter_map(&:report_family).
                          uniq.
                          sort_by { |r| r[:name] }

        render json: Panko::ArraySerializer.new(
          report_families,
          each_serializer: Administration::ReportFamilySerializer
        ).to_a
      end

      def regenerate
        AdminJob.call(
          :bulk_regenerate_reports,
          {
            ids: regenerate_report_params[:ids], selected_reports: regenerate_report_params[:selected_reports],
            campaign_id: campaign.id
          },
          current_user
        )
        audit! :regenerate, nil, record_type: 'CampaignReport', payload: { ids: params[:ids] }, campaign: campaign

        head :ok
      end

      def bulk_download
        campaign_reports = campaign.campaign_reports.where(report_id: params['selected_reports'].keys)

        user_reports = ::Reports::BulkDownloadsQuery.new(campaign_reports, report_download_params).query.pluck(:id)

        report_count = user_reports.count

        if report_count > 1000
          render json: { errors: I18n.t('campaign_report.bulk_download.error', count: report_count) },
                 status: :unprocessable_entity
        else
          AdminJob.call(:bulk_download_reports,
                        { ids: params[:ids], selected_reports: params['selected_reports'], campaign_id: campaign.id,
                          start_date: params[:start_date], end_date: params[:end_date],
                          include_inactive_users: params[:include_inactive_users] },
                        current_user)
          audit! :bulk_download, nil, record_type: 'CampaignReport', payload: { ids: params[:ids] }, campaign: campaign

          head :ok
        end
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
            toggle_auto_assign
            toggle_require_scheduling
            update_prework
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
            'toggle_auto_assign',
            'toggle_user_dashboard',
            'toggle_main_report'
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def resource_params
        params[:resource].permit(
          :report_family_id,
          :operation,
          report_access: {},
          report_ids: []
        )
      end

      def report_download_params
        params.permit(
          :start_date,
          :end_date,
          :include_inactive_users,
          selected_reports: {}
        )
      end

      def regenerate_report_params
        params[:data].permit(
          selected_reports: {},
          ids: []
        )
      end

      def resource_class
        CampaignReport
      end
    end
  end
end

# rubocop:enable Metrics/ClassLength
