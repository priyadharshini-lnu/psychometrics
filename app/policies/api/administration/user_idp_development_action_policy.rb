# frozen_string_literal: true

module Api
  module Administration
    class UserIdpDevelopmentActionPolicy < Administration::BasePolicy
      def manage?
        has_permission?(:idp_plan, :manage)
      end

      def show?
        has_permission?(:idp_plan, :manage)
      end

      def index?
        has_permission?(:idp_plan, :manage)
      end

      def bulk_update?
        has_permission?(:idp_plan, :manage)
      end

      def generate_by_ai?
        has_permission?(:idp_plan, :manage)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope.with_public_skills
        end
      end
    end
  end
end
