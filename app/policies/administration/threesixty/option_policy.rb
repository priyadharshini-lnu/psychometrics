# frozen_string_literal: true

module Administration
  module Threesixty
    class OptionPolicy < BasePolicy
      def participant_options?
        has_permission?(:campaigns, :participant_options)
      end

      def report_options?
        has_permission?(:campaigns, :report_options)
      end

      def update_language?
        has_permission?(:campaigns, :report_options)
      end

      def message_options?
        has_permission?(:messages, :options)
      end

      def update?
        has_permission?(:messages, :options)
      end
    end
  end
end
