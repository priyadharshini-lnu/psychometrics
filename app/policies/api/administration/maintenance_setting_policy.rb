# frozen_string_literal: true

module Api
  module Administration
    class MaintenanceSettingPolicy < ::Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end
    end
  end
end
