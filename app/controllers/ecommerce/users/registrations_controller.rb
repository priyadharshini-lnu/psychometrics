module Ecommerce
  module Users
    class RegistrationsController < Devise::RegistrationsController
      before_action :configure_permitted_parameters
      helper_method :resource_name, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      def after_sign_up_path_for(_resource)
        new_ecommerce_orders_path
      end

      protected

      def configure_permitted_parameters
        devise_parameter_sanitizer.permit(:sign_up) do |u|
          u.permit(:email, :password, :password_confirmation, :first_name, :last_name, :terms)
        end
      end
    end
  end
end
