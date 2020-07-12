# frozen_string_literal: true

module Administration
  module Campaigns
    class UsersController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update spoof]

      def index
        users = campaign.
                users.
                includes(:creator, :modifier).
                ransack(params[:filters]).result

        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = 'attachment; filename="users.csv"'
            headers['Content-Type'] ||= 'text/csv'
            render :index, locals: { users: users, resource_class: resource_class }
          end
          format.json do
            serialized_users = ActiveModelSerializers::SerializableResource.new(
              users.page(params[:page]), each_serializer: Administration::Campaigns::UserSerializer
            )

            render json: {
              list: serialized_users,
              total: users.count
            }
          end
        end
      end

      def create
        form = ::Campaigns::Users::CreateForm.from_params(resource_params).with_context(campaign: campaign)
        if form.valid?
          ::Campaigns::Users::Create.call(form, campaign, current_user) do
            on(:ok) { |user| return render json: user, serializer: Administration::Campaigns::UserSerializer }
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

      def spoof
        spoof_token = SecureRandom.urlsafe_base64(64)
        resource.update_column(:spoof_token, spoof_token)

        redirect_to root_url(domain: Settings.domain, subdomain: project.subdomain, spoof_token: spoof_token)
      end

      private

      def pundit_authorize
        authorize(resource || User, nil, policy_class: Campaigns::UserPolicy)
      end

      def resource_class
        User
      end
    end
  end
end
