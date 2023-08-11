# frozen_string_literal: true

module Api
  module Administration
    class WorkshopInvitedSubjectPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view)
      end

      def destroy?
        has_permission?(:workshops, :manage)
      end
    end
  end
end
