# frozen_string_literal: true

module Api
  module Administration
    class MembershipPolicy < BasePolicy
      class Scope < Scope
        def resolve
          ::Administration::MembershipPolicy::Scope.new(user, Membership).resolve
        end
      end

      def spoof?
        @user.is?(:superadmin)
      end
    end
  end
end
