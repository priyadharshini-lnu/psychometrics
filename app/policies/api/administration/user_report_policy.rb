# frozen_string_literal: true

module Api
  module Administration
    class UserReportPolicy < BasePolicy
      class Scope < BasePolicy::Scope
        def resolve
          UserReport
        end
      end
    end
  end
end
