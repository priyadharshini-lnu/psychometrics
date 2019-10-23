# frozen_string_literal: true

module Administration
  module Administrator
    class PasswordsController < Devise::PasswordsController
      include PasswordReset

      helper_method :resource_name, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      private

      def after_sending_reset_password_instructions_path_for(_resource_name)
        root_path
      end
    end
  end
end
