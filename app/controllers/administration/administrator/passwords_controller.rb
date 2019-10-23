# frozen_string_literal: true

module Administration
  module Administrator
    class PasswordsController < Devise::PasswordsController
      helper_method :resource_name, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      def new
        @form = Users::PasswordResetForm.new
      end

      def create
        @form = Users::PasswordResetForm.from_params(params[:user]).with_context(subdomain: request.subdomain)

        resource_class.send_reset_password_instructions(resource) if resource
        if @form.valid? && successfully_sent?(@form.user)
          resource_class.send_reset_password_instructions(@form.user)
          respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
        else
          render :new
        end
      end

      protected

      def after_sending_reset_password_instructions_path_for(_resource_name)
        if resource.is?(:superadmin, :client_admin, :project_admin)
          administration_root_path
        else
          super
        end
      end
    end
  end
end
