# frozen_string_literal: true

module Administration
  class ReportApprovalPolicy < Administration::BasePolicy
    def app?
      @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
    end
  end
end
