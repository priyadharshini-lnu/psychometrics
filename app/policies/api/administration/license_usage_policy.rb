# frozen_string_literal: true

module Api
  module Administration
    class LicenseUsagePolicy < ::Administration::LicensePolicy
      def index?
        can_manage_licenses?
      end

      def toggle_status?
        can_manage_licenses?
      end

      private

      def can_manage_licenses?
        has_permission?(:clients, :view_licenses)
      end
    end
  end
end
