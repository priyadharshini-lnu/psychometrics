# frozen_string_literal: true

module Administration
  module Threesixty
    class OptionPolicy < BasePolicy
      def participant_options?
        super_admins_or_admins?
      end

      def report_options?
        participant_options?
      end

      def message_options?
        participant_options?
      end
    end
  end
end
