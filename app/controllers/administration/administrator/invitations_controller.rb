# frozen_string_literal: true

module Administration
  module Administrator
    class InvitationsController < Devise::InvitationsController
      helper_method :resource_name, :devise_mapping
      layout 'administration/devise'

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      # Redirect administrator after log in
      #
      def after_sign_in_path_for(_resource)
        admin_path
      end
    end
  end
end
