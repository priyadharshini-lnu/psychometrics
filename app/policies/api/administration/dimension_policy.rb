# frozen_string_literal: true

module Api
  module Administration
    class DimensionPolicy < ::Administration::DimensionPolicy
      def show?
        return has_permission?(:dimensions, :view, project_id: record_owner_id) if record_owner_id

        index?
      end

      def destroy?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def edit?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def assessor_dimensions?
        has_permission?(:campaign_factors, :manage)
      end

      def factors?
        has_permission?(:campaign_factors, :manage)
      end

      def export_translations?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def import_translations?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def copy?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def import?
        has_permission?(:dimensions, :manage)
      end

      def validate_import?
        has_permission?(:dimensions, :manage)
      end

      private

      def record_owner_id
        return if @record.is_a?(Class)

        @record&.owner_id
      end
    end
  end
end
