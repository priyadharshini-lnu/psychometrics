# frozen_string_literal: true

module Administration
  module Threesixty
    class ReportPolicy < BasePolicy
      alias export? show?

      def show?
        has_permission?(:results, :view_report)
      end

      def download?
        has_permission?(:results, :view_report)
      end

      def regenerate?
        has_permission?(:results, :regenerate_report)
      end
    end
  end
end
