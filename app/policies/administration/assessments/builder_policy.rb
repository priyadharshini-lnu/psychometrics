# frozen_string_literal: true

module Administration
  module Assessments
    class BuilderPolicy < Administration::BasePolicy
      def update?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end
    end
  end
end
