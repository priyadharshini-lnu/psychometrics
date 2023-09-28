# frozen_string_literal: true

module Administration
  module Threesixty
    class EmailTemplatePolicy < BasePolicy
      def send_test_email?
        has_permission?(:messages, :email)
      end

      def index?
        has_permission?(:messages, :email)
      end

      def update?
        has_permission?(:messages, :email)
      end

      def show?
        has_permission?(:messages, :email)
      end
    end
  end
end
