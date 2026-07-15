# frozen_string_literal: true

module Api
  module Administration
    class FactorPolicy < ::Administration::FactorPolicy
      def index?
        return has_permission?(:campaigns, :manage) if project_id.present? || campaign_id.present?

        super
      end

      def show?
        return has_permission?(:dimensions, :view, project_id: record_owner_id) if record_owner_id

        index?
      end

      def copy?
        return has_permission?(:dimensions, :manage, project_id: record_owner_id) if record_owner_id

        super
      end

      def import?
        index?
      end

      def questions?
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
