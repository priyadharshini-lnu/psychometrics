# frozen_string_literal: true

module Api
  module Administration
    class OccupationConditionSetPolicy < ::Administration::OccupationConditionSetPolicy
      def show?
        return has_permission?(:dimensions, :view, project_id: record_owner_id) if record_owner_id

        index?
      end

      private

      def record_owner_id
        return if @record.is_a?(Class)

        @record&.dimension&.owner_id
      end
    end
  end
end
