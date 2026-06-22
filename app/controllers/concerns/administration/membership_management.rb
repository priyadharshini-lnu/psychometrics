# frozen_string_literal: true

module Administration
  module MembershipManagement
    extend ActiveSupport::Concern

    included do
      skip_after_action :verify_policy_scoped, only: %i[index show]
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update destroy spoof reset_password]
    end

    def index
      respond_to do |format|
        format.json do
          serialized_admins = Panko::ArraySerializer.new(
            admins.page(params[:page]),
            each_serializer: Administration::Memberships::WithPermissionsSerializer,
            context: {
              current_user: current_user,
              project_id: campaign.project_id,
              campaign_id: campaign.id
            }
          ).to_a

          render json: {
            list: serialized_admins,
            total: admins.count,
            permissions: permissions
          }
        end
      end
    end

    def show
      render json: Administration::Memberships::WithGrantsAndPermissionsSerializer.new(
        context: {
          current_user: current_user,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      ).serialize(resource)
    end

    def create
      ::Memberships::CreateAdminCommand.
        call(
          resource_class.new(permitted_resource_params), project, current_user, role, campaign
        ) do
        on(:ok) do |admin|
          audit! :create, admin, campaign: campaign, payload: permitted_resource_params
          return render json: Administration::Memberships::WithPermissionsSerializer.new(
            context: {
              current_user: current_user, project_id: campaign.project_id
            }
          ).serialize(admin)
        end
      end
    end

    def update
      form = ::Memberships::CreateForm.from_params(permitted_resource_params['user_attributes'])
      ::Campaigns::Admins::Update.call(resource, form, current_user, permitted_resource_params) do
        on(:ok) do |admin|
          audit! :update, admin, campaign: campaign, payload: permitted_resource_params
          return render json: Administration::Memberships::WithPermissionsSerializer.new(
            context: {
              current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
            }
          ).serialize(admin)
        end
        on(:invalid) do |f|
          return render json: { errors: f.errors.full_messages.first }, status: 400
        end
        on(:error) { |error| return render json: { errors: error }, status: 422 }
      end
    end

    def destroy
      resource.destroy!
      audit! :delete, resource, campaign: campaign
      render json: { id: resource.id }, status: :ok
    end

    def spoof
      audit! :sign_in_as, resource.user, payload: { sign_in_as: resource.user.email }
      role_name = resource.role.to_s.humanize.titleize
      siem_log_impersonation_event(resource.user, role_name)
      impersonate_as_admin(resource.user)
      redirect_url ||= admin_path
      flash.now[:success] = t('administration.memberships.spoof.successfully', name: resource.decorate.display_name)
      redirect_to redirect_url
    end

    def reset_password
      resource.user.send_reset_password_instructions
      audit! :reset_password, resource.user, campaign: campaign
      render json: :ok
    end

    private

    def set_resource_class
      @_resource_class ||= Membership # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def pundit_authorize
      authorize(
        resource_class,
        nil,
        project_id: project_id,
        campaign_id: campaign.id,
        policy_class: policy_class_name
      )
    end

    def permitted_resource_params
      params.expect(
        resource: ::Memberships::PermittedAdminParams.call!(params[:action], current_user, resource)
      )
    end
  end
end
