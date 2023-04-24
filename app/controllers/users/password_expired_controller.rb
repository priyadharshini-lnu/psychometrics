# frozen_string_literal: true

module Users
  class PasswordExpiredController < Devise::PasswordExpiredController
    layout 'devise'

    def update
      resource.extend(Devise::Models::DatabaseAuthenticatablePatch)
      if resource.update_with_password(resource_params)
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
      return if warden.session(:user)['enforce_password_change']

      super
    end
  end
end
