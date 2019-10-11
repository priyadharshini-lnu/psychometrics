# frozen_string_literal: true

module Administration
  module Administrator
    class SessionsController < Devise::SessionsController
      helper_method :resource_nam, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      # Redirect administrator after log in
      def after_sign_in_path_for(_resource)
        administration_root_path
      end

      def after_sign_out_path_for(_resource)
        new_administration_session_path
      end
    end
  end
end
