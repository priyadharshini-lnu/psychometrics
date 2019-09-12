# frozen_string_literal: true

module Administration
  class ClientReportPolicy < Administration::BasePolicy
    def create?
      super || @user.has_grant?(:reports, :manage)
    end
  end
end
