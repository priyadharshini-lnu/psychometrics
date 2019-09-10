# frozen_string_literal: true

module Ecommerce
  module Users
    class SessionsController < Devise::SessionsController
      helper_method :resource_name, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      # Redirect administrator after log in
      #
      def after_sign_in_path_for(_resource)
        new_ecommerce_orders_path
      end

      def after_sign_out_path_for(_resource)
        new_ecommerce_session_path
      end
    end
  end
end
