# frozen_string_literal: true

module Api
  module Administration
    class WorkshopFacilitatorPolicy < ::Administration::BasePolicy
      def search_managers?
        has_permission?(:workshops, :view)
      end

      def search_assessors?
        has_permission?(:workshops, :view)
      end
    end
  end
end
