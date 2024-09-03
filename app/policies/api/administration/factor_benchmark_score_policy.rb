# frozen_string_literal: true

module Api
  module Administration
    class FactorBenchmarkScorePolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:campaigns, :manage_factor_benchmark_scores)
      end

      def bulk_create?
        has_permission?(:campaigns, :manage_factor_benchmark_scores)
      end
    end
  end
end
