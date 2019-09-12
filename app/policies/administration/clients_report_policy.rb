# frozen_string_literal: true

module Administration
  class ClientsReportPolicy < Administration::BasePolicy
    def create?
      super || @user.has_grant?(:reports, :manage)
    end
  end
end
