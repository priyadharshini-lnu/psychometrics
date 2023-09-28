# frozen_string_literal: true

module Api
  module Administration
    class ReportFamilyPolicy < ::Administration::ClientPolicy
      def index?
        @user.is?(:superadmin)
      end
    end
  end
end
