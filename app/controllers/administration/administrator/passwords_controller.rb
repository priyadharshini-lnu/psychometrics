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

      protected

      def after_sending_reset_password_instructions_path_for(_resource_name)
        administration_root_path
      end
    end
  end
end
