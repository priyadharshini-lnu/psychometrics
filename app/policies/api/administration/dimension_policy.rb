# frozen_string_literal: true

module Api
  module Administration
    class DimensionPolicy < ::Administration::DimensionPolicy
      def assessor_dimensions?
        has_permission?(:campaign_factors, :manage)
      end

      def factors?
        has_permission?(:campaign_factors, :manage)
      end
    end
  end
end
