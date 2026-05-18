# frozen_string_literal: true

module Users
  class PasswordExpiredController < Devise::PasswordExpiredController
    layout 'devise'
    skip_before_action :ensure_user_profile_completed, only: %i[show update]

    def update
      resource.extend(Devise::Models::DatabaseAuthenticatablePatch)
      if resource.update_with_password(resource_params)
        audit!(
          :reset_password,
          resource,
          user: resource,
          payload: {
            email: resource.email,
            force_password_change: false
          },
          outcome: 'successful'
        )

        warden.session(scope)['password_expired'] = false
        warden.session(scope)['enforce_password_change'] = false
        set_flash_message :notice, :updated
        bypass_sign_in resource, scope: scope
        respond_with({}, location: after_password_expired_update_path_for(resource))
      else
        clean_up_passwords(resource)
        respond_with(resource, action: :show)
      end
    end

    def skip_password_change
      return if user_signed_in? && warden.session(:user)['enforce_password_change']

      super
    end

    def resource_params
      super.merge(force_password_change: false)
    end
  end
end
