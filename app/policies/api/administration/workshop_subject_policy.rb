# frozen_string_literal: true

module Api
  module Administration
    class WorkshopSubjectPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view)
      end

      def update?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        has_permission?(:workshops, :view)
      end
    end
  end
end
