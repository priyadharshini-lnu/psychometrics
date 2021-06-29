# frozen_string_literal: true

module Administration
  class ClientsReportPolicy < Administration::BasePolicy
    def create?
      super || @user.has_client_grant?(:reports, :manage, @project_id)
    end
  end
end
