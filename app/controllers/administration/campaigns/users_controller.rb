# frozen_string_literal: true

module Administration
  module Campaigns
    class UsersController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[update spoof show destroy toggle_status reset_password extend_time]
      skip_before_action :pundit_authorize, only: %i[spoof]

      def index
        users = campaign.
                users.
                includes(:creator, :modifier, campaign_users: [:campaign], user_assessments: :users_result).
                ransack(params[:filters]).result

        respond_to do |format|
          format.json do
            serialized_users = ActiveModelSerializers::SerializableResource.new(
              users.page(params[:page]).per(params[:size] || 25),
              each_serializer: Administration::Campaigns::UserSerializer,
              current_user: current_user,
              campaign_id: campaign.id,
              project_id: campaign.project_id
            )

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
            'export_sign_in_url'
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def search
        users = ::Users::SearchQuery.new(campaign, params[:q]).query.map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def export_completion_status
        audit! :export_completion_status, campaign, campaign: campaign
        AdminJob.call(
          :completion_status_export,
          { campaign_id: campaign.id },
          current_user
        )
        head :ok
      end

      def export_compact_completion_status
        audit! :export_compact_completion_status, campaign, campaign: campaign
        AdminJob.call(
          :compact_completion_status_export,
          { campaign_id: campaign.id },
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

      def export
        audit! :export_users, campaign, campaign: campaign
        AdminJob.call(
          :export_users,
          {
            campaign_id: campaign.id,
            filters: params[:filters],
            export_sign_in_url: params[:export_sign_in_url] == 'true'
          },
          current_user
        )
        head :ok
      end

      def show
        render json: resource, serializer: Administration::UserDetailSerializer, campaign: campaign
      end

      def create
        form = ::Campaigns::Users::CreateForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          ::Campaigns::Users::Create.call(form, campaign, current_user) do
            on(:ok) do |user|
              audit! :create_campaign_user, campaign, payload: resource_params.permit!, campaign: campaign
              return render json: user, serializer: Administration::Campaigns::UserSerializer,
                            campaign_id: campaign.id, project_id: campaign.project_id
            end
            on(:error) do |errors|
              return render json: { errors: errors.is_a?(String) ? { base: errors } : errors },
                            status: 422
            end
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::Campaigns::Users::EditForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          audit! :update_campaign_user, campaign, payload: resource_params.permit!, campaign: campaign
          resource.update(form.attributes)
          render json: resource, serializer: Administration::Campaigns::UserSerializer,
                 campaign_id: campaign.id, project_id: campaign.project_id
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
        audit! :sign_in_as, current_user, payload: { sign_in_as: resource.email }
        spoof_token = SecureRandom.urlsafe_base64(64)
        resource.update_column(:spoof_token, spoof_token)

        redirect_to root_url(domain: Settings.domain, subdomain: project.subdomain, spoof_token: spoof_token),
                    allow_other_host: true
      end

      def extend_time
        ::CampaignUsers::AddAdditionalTime.call!(campaign_user, params[:additional_time] * 60)
        audit! :extend_time, campaign_user, payload: { additional_time: params[:additional_time] }
        render json: resource, serializer: Administration::UserDetailSerializer, campaign: campaign
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

      def resource_class
        User
      end

      def set_resource
        @_resource = campaign.users.find(params[:id])
      end

      def campaign_user
        @campaign_user ||= resource.campaign_users.find_by(campaign: campaign)
      end
    end
  end
end
