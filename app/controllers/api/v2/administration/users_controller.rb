# frozen_string_literal: true

module Api
  class V2::Administration::UsersController < Api::V2::Administration::BaseController
    validates_request_schema :create_superadmin, Api::V2::User::CreateSuperadminContract.new

    def reset_password
      resource.send_reset_password_instructions
      audit! :reset_password_email, resource, payload: { email: resource.email }
      render json: :ok
    end

    def roles
      render json: { data: { attributes: { roles: Users::BuildRolesWithLinks.call!(resource) } } }
    end

    def create_superadmin
      user = User.new(create_resource_params)
      user.role = User::SUPER_ADMIN_ROLE
      user.created_by_id = current_user.id
      user.modified_by_id = current_user.id
      user.create_by_invite = true
      user.save!
      audit! :create_superadmin, user, payload: create_resource_params
      user.invite!(current_user)
      jsonapi_render json: user
    end

    private

    def resource
      @resource ||= Api::Administration::UserPolicy::Scope.new(
        current_user, User
      ).resolve.find(params[:user_id])
    end

    def create_resource_params
      params.require(:data).require(:attributes).permit(:first_name, :last_name, :email)
    end
  end
end
