# frozen_string_literal: true

module Api
  module Administration
    class ReportFamiliesReportPolicy < ::Administration::ClientPolicy
      def index?
        @user.is?(:superadmin)
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
