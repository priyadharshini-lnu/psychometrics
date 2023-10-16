# frozen_string_literal: true

module Administration
  module Administrator
    class SessionsController < Devise::SessionsController
      helper_method :resource_nam, :devise_mapping
      layout 'administration/devise'

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      # Redirect administrator after log in
      def after_sign_in_path_for(resource)
        return administration_dashboard_path if helpers.show_dashboard?
        return assessors_dashboard_path if resource.is?(:assessor)

        stored_location_for(resource) || admin_path
      end

      def after_sign_out_path_for(_resource)
        root_path
      end
    end
  end
end
