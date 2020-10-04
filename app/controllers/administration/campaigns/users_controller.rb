# frozen_string_literal: true

module Administration
  module Campaigns
    class UsersController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update spoof show destroy toggle_status reset_password extend_time]

      def index
        users = campaign.
                users.
                includes(:creator, :modifier, :campaign_users, user_assessments: :users_result).
                ransack(params[:filters]).result

        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = 'attachment; filename="users.csv"'
            headers['Content-Type'] ||= 'text/csv'
            render :index, locals: {
              users: users,
              campaign: campaign,
              resource_class: resource_class,
              headers: UserDecorator.export_headers
            }
          end
          format.json do
            serialized_users = ActiveModelSerializers::SerializableResource.new(
              users.page(params[:page]),
              each_serializer: Administration::Campaigns::UserSerializer,
              campaign_id: campaign.id
            )

            render json: {
              list: serialized_users,
              total: users.count
            }
          end
        end
      end

      def export_completion_status
        headers['Content-Disposition'] = 'attachment; filename="completion_statuses.csv"'
        headers['Content-Type'] ||= 'text/csv'
        users_results = UsersResult.joins(:user_assessments).where(user_assessments: { campaign_id: campaign.id }).
                        includes(:evaluator, :assessment)
        render :export_completion_status, locals: {
          users_results: users_results,
          headers: UsersResultDecorator.export_headers
        }
      end

      def import
        import_data = ::Campaigns::Users::ParseImportData.call!(params[:import_data])
        form = ::Campaigns::Users::ImportForm.new(import_data: import_data, operation: params[:operation]).
               with_context(campaign: campaign)
        if form.valid?
          updated_users = ::Campaigns::Users::ProcessImport.
                          call!(campaign, current_user, import_data[1..-1], params[:operation])
          render json: updated_users
        else
          render json: { errors: form.errors.full_messages }, status: 422
        end
      end

      def show
        render json: resource, serializer: Administration::UserDetailSerializer, campaign: campaign
      end

      def create
        form = ::Campaigns::Users::CreateForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          ::Campaigns::Users::Create.call(form, campaign, current_user) do
            on(:ok) do |user|
              return render json: user, serializer: Administration::Campaigns::UserSerializer, campaign_id: campaign.id
            end
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::Campaigns::Users::EditForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          resource.update(form.attributes)
          render json: resource, serializer: Administration::Campaigns::UserSerializer
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
        render json: resource.id
      end

      def reset_password
        resource.send_reset_password_instructions
        render json: :ok
      end

      def spoof
        spoof_token = SecureRandom.urlsafe_base64(64)
        resource.update_column(:spoof_token, spoof_token)

        redirect_to root_url(domain: Settings.domain, subdomain: project.subdomain, spoof_token: spoof_token)
      end

      def extend_time
        ::CampaignUsers::AddAdditionalTime.call!(campaign_user, params[:additional_time])
        render json: resource, serializer: Administration::Campaigns::UserSerializer, campaign_id: campaign.id
      end

      private

      def pundit_authorize
        authorize(resource || User, nil, policy_class: Campaigns::UserPolicy)
      end

      def resource_class
        User
      end

      def campaign_user
        @campaign_user ||= resource.campaign_users.find_by(campaign: campaign)
      end
    end
  end
end
