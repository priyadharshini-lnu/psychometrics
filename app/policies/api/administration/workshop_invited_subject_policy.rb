# frozen_string_literal: true

module Api
  module Administration
    class WorkshopInvitedSubjectPolicy < ::Administration::BasePolicy
      def get_related_resources?
        has_permission?(:workshops, :view)
      end

      def index?
        has_permission?(:workshops, :view)
      end

      def create?
        has_permission?(:workshops, :manage)
      end

      def destroy?
        has_permission?(:workshops, :manage)
      end

      def reject_request?
        has_permission?(:workshops, :manage)
      end

      def accept_request?
        has_permission?(:workshops, :manage)
      end

      def resend_invite?
        has_permission?(:workshops, :manage)
      end
    end
  end
end
