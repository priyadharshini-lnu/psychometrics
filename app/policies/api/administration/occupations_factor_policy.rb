# frozen_string_literal: true

module Api
  module Administration
    class OccupationsFactorPolicy < ::Administration::OccupationsFactorPolicy
      def show?
        return has_permission?(:dimensions, :view, project_id: record_owner_id) if record_owner_id

        index?
      end

      def destroy?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      private

      def record_owner_id
        return if @record.is_a?(Class)

        @record&.occupation&.dimension&.owner_id
      end
    end
  end
end
