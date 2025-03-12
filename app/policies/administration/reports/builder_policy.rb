# frozen_string_literal: true

module Administration
  module Reports
    class BuilderPolicy < Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
      end

      def update?
        @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
      end

      def upload_campaign_factors?
        @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
      end
    end
  end
end
