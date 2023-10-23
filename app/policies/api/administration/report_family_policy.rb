# frozen_string_literal: true

module Api
  module Administration
    class ReportFamilyPolicy < ::Administration::ReportFamilyPolicy
      def index?
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
