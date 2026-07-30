# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

module Administration
  module Campaigns
    class UserReportsController < Administration::Campaigns::BaseController
      include UserReports::PdfGeneration
      include AsyncRequestHandler

      before_action :ensure_project, except: %i[dashboard]

      before_action :set_resource, only: %i[show approve destroy download pdf_preview toggle_user_access
                                            start_qc abort_qc send_for_approval request_changes possible_webhook_events
                                            remove_approval mark_ready webhook_payload upload_file remove_file
                                            translate]
      before_action :pundit_authorize

      async_request :translate, handler: ::AI::Translations::UserReport,
                  permit_params: ->(params) { permit_translate_params(params) }

      def create
        form = ::Campaigns::UserReports::AddForm.from_params(resource_params)
        if form.valid?
          ::Campaigns::UserReports::Add.call(form, campaign_user, current_user) do
            on(:ok) do
              render json: Administration::UserDetailSerializer.new(
                context: {
                  campaign: campaign_user.campaign,
                  current_user: current_user
                }
              ).serialize(campaign_user.user)
            end
            on :insufficient_license, :new_assessment_response_not_allowed do |errors|
              return render json: { errors: errors }, status: 422
            end
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def upload_file
        resource.attach_pdf!(params[:file])
        render json: Administration::UserReportSerializer.new(
          context: {
            current_user: current_user,
            campaign: campaign
          }
        ).serialize(resource)
      end

      def remove_file
        resource.remove_pdf_and_update_status!
        render json: Administration::UserReportSerializer.new(
          context: {
            current_user: current_user,
            campaign: campaign
          }
        ).serialize(resource)
      end

      def possible_webhook_events
        render json: { events: resource.possible_webhook_events }
      end

      def destroy
        audit! :delete, resource, payload: resource.log_attributes, campaign: resource.campaign
        resource.destroy!

        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: resource.campaign,
            current_user: current_user
          }
        ).serialize(resource.user)
      end

      def start_qc
        audit! :start_qc, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.start_qc!
        resource.update!(qc_user_id: current_user.id)
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def abort_qc
        audit! :abort_qc, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.abort_qc!
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def send_for_approval
        audit! :send_for_approval, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.send_for_approval!
        resource.update!(qc_user_id: current_user.id, qc_at: Time.current)
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def request_changes
        audit! :request_changes, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.request_changes!
        resource.remove_all_report_pdfs!
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def approve
        audit! :approve, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.approve!
        resource.update!(approver_user_id: current_user.id, approved_at: Time.current)
        create_event(old_user_report_status)
        generate_report(resource) if resource.generatable?
        render json: { status: resource.approval_status }
      end

      def remove_approval
        audit! :remove_approval, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status
        resource.remove_approval!
        resource.remove_all_report_pdfs!
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def mark_ready
        return render_forbidden unless resource.can_mark_ready?

        audit! :mark_ready, resource, campaign: resource.campaign
        old_user_report_status = resource.approval_status

        resource.ready!
        create_event(old_user_report_status)
        render json: { status: resource.approval_status }
      end

      def regenerate
        AdminJob.call(
          :bulk_regenerate_user_reports, {
            ids: params[:ids], campaign_id: campaign.id, user_id: params[:user_id],
            selected_reports: params[:selected_reports]
          }, current_user
        )
        audit! :regenerate_report, resource, payload: { ids: params[:ids], campaign_id: campaign.id },
               campaign: campaign

        head :ok
      end

      def bulk_download
        siem_log_sensitive_operation(
          context: 'Bulk Report Download',
          action_description: "downloaded bulk reports for campaign #{campaign.id}",
          action_type: 'Export',
          resource: 'UserReport'
        )
        AdminJob.call(:bulk_download_user_reports, {
          ids: params[:ids],
          selected_reports: params[:selected_reports],
          campaign_id: campaign.id,
          user_id: params[:user_id]
        }, current_user)

        audit! :bulk_download, nil, record_type: 'UserReport', payload: {
          selected_reports: params[:selected_reports],
          user_id: params[:user_id],
          campaign_id: campaign.id
        }, campaign: campaign

        head :ok
      end

      def toggle_user_access
        resource.toggle!(:user_access)
        audit! :toggle_user_access, resource, campaign: campaign
        head :ok
      end

      def dashboard
        user = campaign.users.find_by!(email: params[:email])
        campaign_dashboard = campaign.campaign_reports.find_by!(user_dashboard: true)
        user_dashboard = campaign_dashboard.user_reports.find_by!(user_id: user.id)

        respond_to do |format|
          format.html do
            audit! :view_report, user_dashboard, campaign: user_dashboard.campaign,
              payload: params.merge(user_dashboard.details_to_log)
          end
          format.json do
            render json: Administration::IndividualDashboardSerializer.new(
              context: {
                report: user_dashboard.report,
                results: UserReports::GroupedResultsByAssessment.call!(user_dashboard, view_report_as),
                piped_text_context: {},
                user_results: user_dashboard.user_results(view_report_as),
                current_user: current_user,
                include: '**',
                campaign: campaign
              }
            ).serialize(user_dashboard)
          end
        end
      end

      def webhook_command
        @webhook_command ||= UserReports::Webhook.new(resource)
      end

      def webhook_payload
        data = case params['event_name']
                 when 'report_available'
                   webhook_command.report_available_data
                 when 'results_available'
                   webhook_command.result_available_data
               end

        event_payload = Webhook::EVENTS[params['event_name'].to_sym].call(
          data.merge(project: resource.project, client: resource.project.parent)
        )

        render json: event_payload.as_json
      end

      private

      def permit_translate_params(params)
        texts_hash = params[:texts].present? ? params[:texts].to_unsafe_h : {}
        params.permit(:lang).merge(texts: texts_hash)
      end

      def meta_data
        {
          user_report_id: resource.id
        }
      end

      def create_event(from)
        UserReportEvent.create!(
          user_report_id: resource.id,
          initiator_id: current_user.id,
          event_type: 'status_changed',
          details: {
            from: I18n.t("user_reports.approval_statuses.#{from}"),
            to: I18n.t("user_reports.approval_statuses.#{resource.approval_status}")
          }
        )
      end

      def view_report_as
        :admin
      end

      def generate_report(user_report)
        UserReports::GenerateAndSavePdfJob.perform_later(user_report, current_user)
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def campaign_user
        CampaignUser.find_by!(campaign: campaign, user_id: params[:user_id])
      end

      def resource_class
        UserReport
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.user_reports.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end

# rubocop:enable Metrics/ClassLength
