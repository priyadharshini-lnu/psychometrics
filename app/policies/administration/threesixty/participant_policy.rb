# frozen_string_literal: true

module Administration
  module Threesixty
    class ParticipantPolicy < Threesixty::BasePolicy
      def spoof?
        user.is?(:superadmin)
      end

      def destroy?
        user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
      end
    end
  end
end
