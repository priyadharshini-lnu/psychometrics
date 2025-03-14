# frozen_string_literal: true

module Administration
  module Threesixty
    class ParticipantPolicy < Threesixty::BasePolicy
      def index?
        has_permission?(:campaigns, :manage_users)
      end

      def spoof?
        @user.is?(:superadmin) && !@record&.user&.superadmin?
      end

      def destroy?
        has_permission?(:campaigns, :manage_users)
      end
    end
  end
end
