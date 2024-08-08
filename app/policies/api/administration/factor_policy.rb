# frozen_string_literal: true

module Api
  module Administration
    class FactorPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:campaigns, :manage)
      end

      def questions?
        index?
      end
    end
  end
end
