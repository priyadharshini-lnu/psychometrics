# frozen_string_literal: true

module Api
  module Administration
    class ReportFamilyPolicy < ::Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def show?
        index?
      end

      def manage?
        index?
      end

      def destroy?
        index?
      end
    end
  end
end
