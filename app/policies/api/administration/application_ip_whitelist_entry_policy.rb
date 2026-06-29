# frozen_string_literal: true

module Api
  module Administration
    class ApplicationIpWhitelistEntryPolicy < ApplicationPolicy
      def index?
        @user.superadmin?
      end

      def create?
        @user.superadmin?
      end

      def update?
        @user.superadmin?
      end

      def destroy?
        @user.superadmin?
      end

      def bulk_create?
        @user.superadmin?
      end
    end
  end
end
