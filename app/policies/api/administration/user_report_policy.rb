# frozen_string_literal: true

module Api
  module Administration
    class UserReportPolicy < BasePolicy
      class Scope < BasePolicy::Scope
        def resolve
          user.accessible_records(UserReport, 'results.view_report')
        end
      end
    end
  end
end
