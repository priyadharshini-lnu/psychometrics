module Administration
  module Administrator
    class InvitationsController < Devise::InvitationsController
      helper_method :resource_name, :devise_mapping

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end
    end
  end
end
