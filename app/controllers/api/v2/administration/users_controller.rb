# frozen_string_literal: true

module Api
  class V2::Administration::UsersController < Api::V2::Administration::BaseController
    validates_request_schema :create_superadmin, Api::V2::User::CreateSuperadminContract.new
    validates_request_schema :create_global_assessor, Api::V2::User::CreateGlobalAssessorContract.new
    validates_request_schema :reset_password, Api::V2::User::ResetPasswordContract.new

    prepend_before_action :set_resource, only: %i[reset_password roles]

    def reset_password
      attrs = params.dig(:data, :attributes)
      if attrs[:automatically_generate_password]
        auto_generated_password = @resource.generate_strong_password
      end
      password = auto_generated_password || attrs[:password]
      @resource.update!(
        password: password, force_password_change: attrs[:change_password_on_login]
      )
      audit! :reset_password_email, @resource, payload: attrs.except(:password)
      SendPasswordMailer.password_email(@resource, password).deliver_later if attrs[:send_password_email]
      login_url = Utility::Url.generate(:user_session_url, subdomain: @resource.project&.subdomain)
      render json: json_api_attributes(
        @resource,
        { password: auto_generated_password, login_url: login_url }
      )
    end

    def roles
      render json: { data: { attributes: { roles: Users::BuildRolesWithLinks.call!(@resource) } } }
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

    def change_password
      form = Users::ChangePasswordForm.from_params(change_password_params)
      return render json: { errors: form.errors.messages }, status: 422 unless form.valid?

      if current_user.update_with_password(form.attributes)
        sign_out(current_user)
        render json: { data: { attributes: { message: 'Password changed successfully' } } }
      else
        render json: convert_model_errors_to_json_api_standard(current_user.errors.messages)
      end
    end

    def create_global_assessor
      user = ::Users::CreateOrModifyGlobalAssessor.call!(current_user, create_resource_params)
      audit! :create_global_assessor, user, payload: create_resource_params

      jsonapi_render json: user
    end

    private

    def context_for_schema_validation
      { current_user: current_user, project: project, campaign: campaign, user: @resource }
    end

    def set_resource
      # rubocop:disable Naming/MemoizedInstanceVariableName
      @resource ||= Api::Administration::UserPolicy::Scope.new(
        current_user, User
      ).resolve.find(params[:user_id])
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end

    def create_resource_params
      params.require(:data).require(:attributes).permit(:first_name, :last_name, :email)
    end

    def change_password_params
      params.require(:data).require(:attributes).permit(:current_password, :password, :password_confirmation)
    end
  end
end
