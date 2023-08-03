# frozen_string_literal: true

module Api
  module Administration
    class WorkshopPolicy < ::Administration::BasePolicy
      def create_bulk_workshops?
        has_permission?(:workshops, :manage)
      end

      def index?
        has_permission?(:workshops, :view)
      end

      def show?
        has_permission?(:workshops, :view)
      end

      class Scope < Scope
        def resolve
          user.accessible_records(Workshop, 'workshops.view')
        end
      end
    end
  end
end
