# frozen_string_literal: true

module Api
  module Administration
    class WorkshopInvitePolicy < BasePolicy
      def create?
        has_permission?(:workshops, :manage)
      end

      def show?
        has_permission?(:workshops, :view)
      end

      def show_relationship?
        has_permission?(:workshops, :view)
      end

      def create_relationship?
        has_permission?(:workshops, :manage)
      end

      def destroy_relationship?
        has_permission?(:workshops, :manage)
      end

      def create_subjects_and_translations?
        has_permission?(:workshops, :manage)
      end

      def import_subjects_from_csv?
        has_permission?(:workshops, :manage)
      end

      def import_subjects_from_campaign?
        has_permission?(:workshops, :manage)
      end

      def index?
        has_permission?(:workshops, :view)
      end

      def destroy?
        has_permission?(:workshops, :manage)
      end

      class Scope < BasePolicy::Scope
        def resolve
          WorkshopInvite
        end
      end
    end
  end
end
