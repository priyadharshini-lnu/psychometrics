# frozen_string_literal: true

module Administration
  class ReportApprovalsController < Administration::BaseController
    append_before_action :pundit_authorize

    def app; end

    private

    def pundit_authorize
      authorize nil, :app?, policy_class: Administration::ReportApprovalPolicy
    end
  end
end
