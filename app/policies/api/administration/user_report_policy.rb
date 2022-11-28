# frozen_string_literal: true

module Api
  module Administration
    class UserReportPolicy < BasePolicy
      class Scope < BasePolicy::Scope
        def resolve
          user.accessible_records(UserReport, 'reports.view')
        end
      end
    end
  end
end
