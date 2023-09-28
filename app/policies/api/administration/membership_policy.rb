# frozen_string_literal: true

module Api
  module Administration
    class MembershipPolicy < BasePolicy
      class Scope < BasePolicy::Scope
        def resolve
          ::Administration::MembershipPolicy::Scope.new(user, Membership).resolve
        end
      end

      def show?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def index?
        @user.is?(:superadmin)
      end

      def edit?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end

      def reset_password?
        @user.is?(:superadmin)
      end

      def send_mail?
        @user.is?(:superadmin)
      end

      def spoof?
        @user.is?(:superadmin)
      end
    end
  end
end
