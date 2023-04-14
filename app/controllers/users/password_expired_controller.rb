# frozen_string_literal: true

module Users
  class PasswordExpiredController < Devise::PasswordExpiredController
    layout 'devise'

    def resource_params
      super.merge(force_password_change: false)
    end
  end
end
