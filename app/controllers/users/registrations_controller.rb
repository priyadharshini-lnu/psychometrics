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
            flash[:alert] = I18n.t('administration.clients.registration_codes.errors.license_issue')
            respond_with @form
          end
          on(:ok) do |resource|
            set_flash_message! :notice, :signed_up
            sign_up(resource_name, resource)
            respond_with resource, location: after_sign_up_path_for(resource)
          end
        end
      else
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
