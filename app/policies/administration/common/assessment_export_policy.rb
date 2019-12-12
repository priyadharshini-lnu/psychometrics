# frozen_string_literal: true

module Administration
  module Common
    module AssessmentExportPolicy
      def export_results?
        @user.is?(:superadmin) ||
          (@user.has_grant?(:assessments, :export) && @record.common?) ||
          @user.has_grant?(:assigns, :view)
      end

      def export_raw_results?
        @user.is?(:superadmin) || (@record.common? && @user.has_grant?(:assessments, :export))
      end

      def export_scoring_results?
        export_raw_results?
      end

      def export_normed_results?
        @user.is?(:superadmin) || (@user.has_grant?(:assigns, :view) && @record.common?)
      end

      def export_hogan_results?
        @user.is?(:superadmin) || (@record.hogan? && @user.has_grant?(:assigns, :view))
      end

      def export_mindmill_results?
        @user.is?(:superadmin) || (@record.mindmill? && @user.has_grant?(:assigns, :view))
      end
    end
  end
end
