# frozen_string_literal: true

module Administration
  module Campaigns
    class UniversalLinkPolicy < Administration::BasePolicy
      def activate?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end
    end
  end
end
