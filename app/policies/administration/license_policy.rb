# frozen_string_literal: true

module Administration
  class LicensePolicy < Administration::BasePolicy
    def overview?
      index?
    end

    def index?
      super || @user.has_grant?(:clients, :view_licenses)
    end
  end
end
