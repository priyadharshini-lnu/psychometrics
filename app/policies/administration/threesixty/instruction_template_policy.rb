# frozen_string_literal: true

module Administration
  module Threesixty
    class InstructionTemplatePolicy < BasePolicy
      def index?
        has_permission?(:messages, :instructions)
      end

      def show?
        has_permission?(:messages, :instructions)
      end

      def update?
        has_permission?(:messages, :instructions)
      end
    end
  end
end
