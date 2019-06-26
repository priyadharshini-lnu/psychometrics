# frozen_string_literal: true

module Administration
  module Threesixty
    class ReportPolicy < Administration::BasePolicy
      def show?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      alias_method :download?, :show?
      alias_method :export?, :show?

    end
  end
end
