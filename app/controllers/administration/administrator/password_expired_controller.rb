# frozen_string_literal: true

module Administration
  module Administrator
    class PasswordExpiredController < Devise::PasswordExpiredController
      layout 'administration/devise'

      def update
        resource.extend(Devise::Models::DatabaseAuthenticatablePatch)
        if resource.update_with_password(resource_params)
          warden.session(scope)['password_expired'] = false
          warden.session(scope)['enforce_password_change'] = false
          set_flash_message :notice, :updated
          bypass_sign_in resource, scope: scope
          # The flash covers Rails-rendered landings; the param covers the shell, which renders none.
          redirect_to Utility::Url.with_query_params(
            stored_location_for(scope) || root_path, 'notice' => 'password_updated'
          )
        else
          clean_up_passwords(resource)
          respond_with(resource, action: :show)
        end
      end

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      def resource_params
        super.merge(force_password_change: false)
      end

      def skip_password_change
        return if user_signed_in? && warden.session(:user)['enforce_password_change']

        super
      end
    end
  end
end
