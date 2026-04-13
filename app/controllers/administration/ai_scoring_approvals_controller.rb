# frozen_string_literal: true

module Administration
  class AIScoringApprovalsController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    append_before_action :pundit_authorize

    render_entrypoint %i[app], element: 'admin-app-container', entry: 'admin/admin'

    def app; end

    private

    def pundit_authorize
      authorize nil, :app?, policy_class: Administration::AIScoringApprovalPolicy
    end
  end
end
