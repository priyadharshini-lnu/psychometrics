# frozen_string_literal: true

module Administration
  class LicenseUsagePolicy < Administration::BasePolicy
    def toggle_activation_status?
      @user.is?(:superadmin)
    end
  end
end
