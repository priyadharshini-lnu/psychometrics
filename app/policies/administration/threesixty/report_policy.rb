# frozen_string_literal: true

module Administration
  module Threesixty
    class ReportPolicy < BasePolicy
      alias download? show?
      alias export? show?

      def regenerate?
        user.is?(:superadmin) || user.has_permission?(:results, :regenerate_report, project_id: project_id)
      end
    end
  end
end
