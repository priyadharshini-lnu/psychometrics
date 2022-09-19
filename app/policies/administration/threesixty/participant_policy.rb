# frozen_string_literal: true

module Administration
  module Threesixty
    class ParticipantPolicy < Threesixty::BasePolicy
      def spoof?
        user.is?(:superadmin)
      end

      def destroy?
        has_permission?(:projects, :manage_users)
      end
    end
  end
end
