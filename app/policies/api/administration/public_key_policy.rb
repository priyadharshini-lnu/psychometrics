# frozen_string_literal: true

module Api
  module Administration
    class PublicKeyPolicy < ::Administration::BasePolicy
      def index?
        @user.superadmin?
      end

      def create?
        index?
      end

      def update?
        index?
      end

      def generate_key_pair?
        index?
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope if @user.superadmin?
        end
      end
    end
  end
end
