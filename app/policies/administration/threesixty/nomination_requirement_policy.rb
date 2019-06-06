# frozen_string_literal: true

module Administration
  module Threesixty
    class NominationRequirementPolicy < Administration::BasePolicy
      def index?
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      def save?
        index?
      end
    end
  end
end
