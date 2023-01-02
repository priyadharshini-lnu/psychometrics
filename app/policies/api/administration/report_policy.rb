# frozen_string_literal: true

module Api
  module Administration
    class ReportPolicy < ::Administration::ReportPolicy
      def show?
        @user.has_grant?(:reports, :view)
      end
    end
  end
end
