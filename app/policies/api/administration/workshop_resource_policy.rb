# frozen_string_literal: true

module Api
  module Administration
    class WorkshopResourcePolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view) || user.assessor?
      end

      def create?
        has_permission?(:workshops, :manage)
      end

      def update?
        has_permission?(:workshops, :manage)
      end

      def destroy?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        has_permission?(:workshops, :view) || user.assessor?
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if user.superadmin?

          workshops = WorkshopPolicy::Scope.new(user, Workshop, campaign_id: campaign_id).resolve
          WorkshopResource.where(workshop: workshops)
        end
      end
    end
  end
end
