# frozen_string_literal: true

module Api
  module Administration
    class WorkshopSubjectPolicy < ::Api::Administration::BasePolicy
      def index?
        can_view_workshop?
      end

      def show?
        can_view_workshop?
      end

      def create?
        has_permission?(:workshops, :manage)
      end

      def destroy?
        has_permission?(:workshops, :manage)
      end

      def update?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        can_view_workshop?
      end

      def update_subject_details_and_assessments?
        has_permission?(:workshops, :manage)
      end

      def mark_cancelled?
        has_permission?(:workshops, :manage)
      end

      def re_enroll?
        has_permission?(:workshops, :manage)
      end

      def metadata_for_filters?
        can_view_workshop?
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if user.superadmin?

          workshops = WorkshopPolicy::Scope.new(user, Workshop, campaign_id: campaign_id).resolve
          WorkshopSubject.where(workshop: workshops)
        end
      end
    end
  end
end
