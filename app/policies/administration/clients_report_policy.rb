# frozen_string_literal: true

module Administration
  class ClientsReportPolicy < Administration::BasePolicy
    def create?
      super || @user.has_permission?(:reports, :manage, project_id: project_id)
    end
  end
end
