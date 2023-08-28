# frozen_string_literal: true

module Api
  module Administration
    class WorkshopSubjectPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view) || user.assessor?
      end

      def update?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        has_permission?(:workshops, :view) || user.assessor?
      end

      def update_subject_details_and_assessments?
        has_permission?(:workshops, :manage)
      end

      class Scope < Scope
        def resolve
          return scope if user.superadmin?

          workshops = WorkshopPolicy::Scope.new(user, Workshop).resolve
          WorkshopSubject.where(workshop: workshops)
        end
      end
    end
  end
end
