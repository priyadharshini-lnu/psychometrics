# frozen_string_literal: true

module Administration
  module Campaigns
    class UsersController < Administration::Campaigns::BaseController # rubocop:disable Metrics/ClassLength
      before_action :set_resource,
                    only: %i[update spoof show destroy toggle_status reset_password extend_time webhook_payload
                             create_hogan_credentials update_level update_job_role]
      skip_before_action :pundit_authorize, only: %i[spoof]

      rescue_from AdminJob::AlreadyExistsError do |e|
        render :json, status: 422, json: { errors: [e.message] }
      end

      def index
        users = User.joins(:campaign_users).
                where(campaign_users: { campaign_id: campaign.id }).
                includes(
                  :creator, :modifier, :user_profile, campaign_users: [:campaign], user_assessments: :users_result
                ).ransack(params[:filters]).result

        respond_to do |format|
          format.json do
            serialized_users = Panko::ArraySerializer.new(
              users.page(params[:page]).per(params[:size] || 25),
              each_serializer: Administration::Campaigns::UserSerializer,
              context: {
                current_user: current_user,
                campaign_id: campaign.id,
                project_id: campaign.project_id
              }
            ).to_a

            render json: {
              list: serialized_users,
              total: users.count,
              permissions: permissions
            }
          end
        end
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::UserPolicy,
          current_user,
          nil,
          [
            'create',
            %w[export_users index],
            'export_completion_status',
            'import',
            'edit',
            %w[remove destroy],
            'export_sign_in_url',
            'bulk_download_idp_reports',
            'allow_include_reflective_questions'
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def search
        users = Panko::ArraySerializer.new(
          ::Users::SearchQuery.new(campaign, params[:q]).query,
          each_serializer: ::Projects::SearchUserSerializer
        ).to_a
        render json: users
      end

      def bulk_download_idp_reports
        audit! :bulk_download_idp_reports, campaign, campaign: campaign
        AdminJob.call(
          :bulk_download_idp_reports,
          {
            campaign_id: campaign.id,
            include_reflective_questions: params[:include_reflective_questions],
            lang: params[:lang] || campaign.project.available_locales.first
          },
          current_user
        )
        head :ok
      end

      def export_completion_status
        audit! :export_completion_status, campaign, campaign: campaign
        siem_log_sensitive_operation(
          context: 'Campaign Completion Status Export',
          action_description: "exported completion status for campaign #{campaign.id}",
          action_type: 'Export',
          resource: 'Campaign'
        )
        AdminJob.call(
          :completion_status_export,
          { campaign_id: campaign.id, include_inactive_users: include_inactive_users },
          current_user
        )
        head :ok
      end

      def export_compact_completion_status
        audit! :export_compact_completion_status, campaign, campaign: campaign
        siem_log_sensitive_operation(
          context: 'Campaign Completion Status Export',
          action_description: "exported compact completion status for campaign #{campaign.id}",
          action_type: 'Export',
          resource: 'Campaign'
        )
        AdminJob.call(
          :compact_completion_status_export,
          { campaign_id: campaign.id, include_inactive_users: include_inactive_users },
          current_user
        )
        head :ok
      end

      def import
        import_data = ::Campaigns::Users::ParseImportData.call!(params[:import_data], campaign)
        form = ::Campaigns::Users::ImportForm.new(import_data: import_data, operation: params[:operation]).
               with_context(campaign: campaign, current_user: current_user)
        if form.valid?
          audit! :import_users, campaign, campaign: campaign
          AdminJob.call(:import_users, {
            operation: params[:operation], campaign_id: params[:new_campaign_id]
          }, current_user, params[:import_data])
          render json: :ok
        else
          render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: 422
        end
      end

      def assign_reports_and_assessments
        import_data = ::CampaignUsers::AssignReportsAndAssessments::ParseImportData.call!(
          params[:import_data], campaign
        )
        form = ::CampaignUsers::AssignReportsAndAssessments::ImportForm.new(import_data: import_data).
               with_context(campaign: campaign, current_user: current_user)
        if form.valid?
          audit! :assign_reports_and_assessments, campaign, campaign: campaign
          AdminJob.call(:assign_reports_and_assessments, {
            campaign_id: params[:new_campaign_id]
          }, current_user, params[:import_data])
          render json: :ok
        else
          render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: 422
        end
      end

      def export_reports_and_assessments
        audit! :export_reports_and_assessments, campaign, campaign: campaign
        AdminJob.call(:export_reports_and_assessments, {
          campaign_id: params[:new_campaign_id]
        }, current_user, params[:import_data])
        render json: :ok
      end

      def export
        audit! :export_users, campaign, campaign: campaign
        siem_log_sensitive_operation(
          context: 'Campaign User Export',
          action_description: "exported users for campaign #{campaign.id}",
          action_type: 'Export',
          resource: 'Campaign'
        )
        AdminJob.call(
          :export_users,
          {
            campaign_id: campaign.id,
            filters: params[:filters],
            export_sign_in_url: params[:export_sign_in_url] == true
          },
          current_user
        )
        head :ok
      end

      def show
        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: campaign,
            current_user: current_user
          }
        ).serialize(resource)
      end

      def create
        form = ::Campaigns::Users::CreateForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          ::Campaigns::Users::Create.call(form, campaign, current_user) do
            on(:ok) do |user|
              audit! :create_campaign_user, campaign, payload: resource_params.permit!, campaign: campaign
              return render json: Administration::Campaigns::UserSerializer.new(
                context: {
                  current_user: current_user,
                  campaign_id: campaign.id,
                  project_id: campaign.project_id
                }
              ).serialize(user)
            end
            on(:insufficient_license, :new_assessment_response_not_allowed) do |errors|
              return render json: { errors: errors.is_a?(String) ? { base: errors } : errors },
                            status: 422
            end
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::Campaigns::Users::EditForm.from_params(resource_params).
               with_context(campaign: campaign, current_campaign_user_id: resource.id)
        if form.valid?
          audit! :update_campaign_user, campaign, payload: resource_params.permit!, campaign: campaign
          resource.update(form.attributes.except(:locale))
          resource.user_profile.update(locale: form.attributes[:locale])
          render json: Administration::Campaigns::UserSerializer.new(
            context: {
              current_user: current_user,
              campaign_id: campaign.id,
              project_id: campaign.project_id
            }
          ).serialize(resource)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def toggle_status
        resource.campaign_users.find_by(campaign_id: params[:new_campaign_id]).toggle!(:active)
        head :ok
      end

      def destroy
        campaign_user = resource.campaign_users.find_by(campaign_id: params[:new_campaign_id])
        ::CampaignUsers::Remove.call!(
          campaign_user: campaign_user
        )
        audit! :delete_campaign_user, campaign_user, campaign: campaign_user.campaign,
          payload: { email: resource.email }
        render json: resource.id
      end

      def spoof
        authorize(resource, nil, policy_class: Campaigns::UserPolicy)
        audit! :sign_in_as, resource, payload: { sign_in_as: resource.email }
        siem_log_impersonation_event(resource, 'End User')
        spoof_token = impersonate_as_end_user(resource)

        url_options = { domain: Settings.domain, subdomain: project.subdomain, spoof_token: spoof_token }
        redirect_to root_url(url_options), allow_other_host: true
      end

      def extend_time
        ::CampaignUsers::AddAdditionalTime.call!(campaign_user, params[:additional_time] * 60)
        audit! :extend_time, campaign_user, payload: { additional_time: params[:additional_time] }
        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: campaign,
            current_user: current_user
          }
        ).serialize(resource)
      end

      def update_level
        campaign_user.update!(level: params[:level])
        audit! :update_level, campaign_user, payload: { level: params[:level] }
        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: campaign,
            current_user: current_user
          }
        ).serialize(resource)
      end

      def update_job_role
        if campaign_user.update(
          current_job_role_id: params[:current_job_role_id],
          target_job_role_id: params[:target_job_role_id]
        )
          audit! :update_job_role, campaign_user, payload: {
            current_job_role_id: params[:current_job_role_id],
            target_job_role_id: params[:target_job_role_id]
          }
          render json: Administration::UserDetailSerializer.new(
            context: {
              campaign: campaign,
              current_user: current_user
            }
          ).serialize(resource)
        else
          render json: { errors: campaign_user.errors.messages }, status: 422
        end
      end

      def create_hogan_credentials
        ::Hogan::CreateNewHoganCredential.call!(campaign_user.user, campaign_user.campaign) do
          on(:ok) do
            audit! :create_hogan_credentials, campaign_user, payload: params

            head :ok
          end
          on(:error) do |message|
            render json: { errors: message }, status: 422
          end
        end
      end

      def webhook_payload
        data = case params['event_name']
                 when 'campaign_user_status'
                   webhook_command.campaign_user_status_data
                 when 'campaign_results_available'
                   webhook_command.campaign_results_available_data
               end

        event_payload = Webhook::EVENTS[params['event_name'].to_sym].call(
          data.merge(project: resource.project, client: resource.project.parent)
        )
        render json: event_payload.as_json
      end

      private

      def pundit_authorize
        authorize(
          resource || User,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id,
          policy_class: Campaigns::UserPolicy
        )
      end

      def include_inactive_users
        params[:include_inactive_users] == true
      end

      def resource_class
        User
      end

      def set_resource
        @_resource = campaign.users.find(params[:id])
      end

      def campaign_user
        @campaign_user ||= resource.campaign_users.find_by(campaign: campaign)
      end

      def webhook_command
        @webhook_command ||= CampaignUsers::Webhook.new(campaign_user, params[:webhook_id])
      end
    end
  end
end
