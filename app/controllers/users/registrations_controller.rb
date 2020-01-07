# frozen_string_literal: true

module Users
  class RegistrationsController < Devise::RegistrationsController
    layout 'devise'
    before_action :configure_permitted_parameters

    def new
      @form = Users::RegisterForm.new.with_context(code: params['code'])
    end

    def create
      @form = Users::RegisterForm.from_params(sign_up_params).
              with_context(project: @current_project)

      if @form.valid?
        Users::Register.call(@form, @current_project) do
          on(:error) do
            @form.errors[:base].clear
            @form.errors[:base] << I18n.t('administration.clients.registration_codes.errors.license_issue')
            respond_with @form
          end
          on(:ok) do |_resource|
            flash[:notice] = t('devise.registrations.success')
            redirect_to new_user_session_path
          end
        end
      else
        @form.errors[:base] << I18n.t('administration.clients.registration_codes.errors.review')
        respond_with @form
      end
    end

    protected

    def after_sign_up_path_for(_resource)
      root_path
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up) do |u|
        u.permit(:email, :registration_code, :password, :password_confirmation, :first_name, :last_name)
      end
    end
  end
end
