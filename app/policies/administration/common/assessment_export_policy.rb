# frozen_string_literal: true

module Administration
  module Common
    module AssessmentExportPolicy
      def export_results?
        @user.is?(:superadmin) || (@user.has_grant?(:results, :raw_responses) && @record.common?)
      end

      def export_raw_results?
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:results, :raw_responses))
      end

      def export_scoring_results?
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def export_normed_results?
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def export_raw_factor_scores?
        @record.common? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def export_external_results?
        !@record.common? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def export_hogan_results?
        @record.hogan? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def export_mindmill_results?
        @record.mindmill? && (@user.is?(:superadmin) || @user.has_grant?(:results, :scores))
      end

      def rescore_responses?
        @user.is?(:superadmin) || @user.has_grant?(:results, :rescore_responses)
      end
    end
  end
end
