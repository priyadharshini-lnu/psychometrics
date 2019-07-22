# frozen_string_literal: true

module Administration
  module Threesixty
    class EmailSchedulePolicy < BasePolicy
      def schedulable_templates?
        update?
      end

      def receipient_by_criteria?
        update?
      end
    end
  end
end
