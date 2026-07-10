# frozen_string_literal: true

module Api
  module Administration
    class ApplicationSettingPolicy < ApplicationPolicy
      def index?
        @user.superadmin?
      end

      def show?
        @user.superadmin?
      end

      def update?
        @user.superadmin?
      end
    end
  end
end
