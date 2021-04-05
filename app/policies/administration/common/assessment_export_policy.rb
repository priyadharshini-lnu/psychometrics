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
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:assessments, :export))
      end

      def export_scoring_results?
        export_raw_results?
      end

      def export_normed_results?
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:assigns, :view))
      end

      def export_raw_factor_scores?
        export_scoring_results?
      end

      def export_external_results?
        !@record.common? && (@user.is?(:superadmin) || @user.has_grant?(:assigns, :view))
      end

      def export_hogan_results?
        @record.hogan? && (@user.is?(:superadmin) || @user.has_grant?(:assigns, :view))
      end

      def export_mindmill_results?
        @record.mindmill? && (@user.is?(:superadmin) || @user.has_grant?(:assigns, :view))
      end

      def rescore_responses?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
      end
    end
  end
end
