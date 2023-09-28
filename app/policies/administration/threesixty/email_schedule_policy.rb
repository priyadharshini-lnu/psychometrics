# frozen_string_literal: true

module Administration
  module Threesixty
    class EmailSchedulePolicy < BasePolicy
      def index?
        has_permission?(:messages, :email)
      end

      def create?
        has_permission?(:messages, :email)
      end

      def update?
        has_permission?(:messages, :email)
      end

      def destroy?
        has_permission?(:messages, :email)
      end

      def schedulable_templates?
        has_permission?(:messages, :email)
      end

      def recipient_by_criteria?
        has_permission?(:messages, :email)
      end

      def download?
        has_permission?(:messages, :email)
      end
    end
  end
end
