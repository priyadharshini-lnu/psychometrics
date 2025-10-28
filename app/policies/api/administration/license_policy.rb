# frozen_string_literal: true

module Api
  module Administration
    class LicensePolicy < ::Administration::LicensePolicy
      def index?
        can_manage_licenses?
      end

      def create?
        can_manage_licenses?
      end

      def update?
        can_manage_licenses?
      end

      def view_license_usages?
        can_manage_licenses?
      end

      def license_usages?
        can_manage_licenses?
      end

      private

      def can_manage_licenses?
        has_permission?(:clients, :view_licenses)
      end
    end
  end
end
