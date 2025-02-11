# frozen_string_literal: true

module Api
  module Administration
    module Clients
      class ReportPolicy < ::Api::Administration::BasePolicy
        def index?
          has_permission?(:clients, :view, project_id: project_id)
        end

        class Scope < ::Api::Administration::BasePolicy::Scope
          def resolve
            return scope.none unless @user.has_permission?(:clients, :view, project_id: project_id)

            client = ::Client.find(project_id)

            client.available_reports.distinct
          end
        end
      end
    end
  end
end
