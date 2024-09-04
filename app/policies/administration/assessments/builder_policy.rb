# frozen_string_literal: true

module Administration
  module Assessments
    class BuilderPolicy < Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end

      def update?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end
    end
  end
end
