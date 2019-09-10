# frozen_string_literal: true

module Administration
  module Reports
    class BuilderPolicy < Administration::BasePolicy
      def update?
        @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
      end
    end
  end
end
