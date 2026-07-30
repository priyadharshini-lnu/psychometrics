# frozen_string_literal: true

module Api
  module Administration
    class UserPreferencePolicy < BasePolicy
      def index?
        true
      end

      def show?
        record.user_id == @user.id
      end

      # `record` is the class on create; ownership is enforced by the resource's before_create.
      def create?
        true
      end

      def update?
        record.user_id == @user.id
      end

      def destroy?
        record.user_id == @user.id
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          scope.where(user_id: @user.id)
        end
      end
    end
  end
end
