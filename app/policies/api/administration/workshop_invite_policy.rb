# frozen_string_literal: true

module Api
  module Administration
    class WorkshopInvitePolicy < BasePolicy
      def create?
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

      class Scope < Scope
        def resolve
          user.accessible_records(WorkshopInvite, 'workshops.view')
        end
      end
    end
  end
end
