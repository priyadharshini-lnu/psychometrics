# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluationPolicy < Threesixty::BasePolicy
      def show?
        has_permission?(:results, :raw_responses)
      end

      def destroy?
        has_permission?(:results, :reset_responses)
      end
    end
  end
end
