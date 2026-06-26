# frozen_string_literal: true

module Administration
  module Assessments
    module CommonPolicy
      def export_results?
        @user.is?(:superadmin) || (@user.has_permission?(
          :results, :raw_responses, project_id: project_id
        ) && @record.common?)
      end

      def export_raw_results?
        (@record.common? || @record.microsite?) && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :raw_responses, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_scoring_results?
        @record.common? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_normed_results?
        @record.dimension.present? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_raw_factor_scores?
        @record.dimension.present? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_ai_factor_scores?
        @record.has_ai_questions? && @record.dimension.present? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_external_results?
        !@record.common? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def export_hogan_results?
        @record.hogan? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def rescore_responses?
        @user.is?(:superadmin) || @user.has_permission?(
          :results, :rescore_responses, project_id: project_id, campaign_id: campaign_id
        )
      end

      def rescore_ai_responses?
        @record.has_ai_questions? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :rescore_responses, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def regenerate_transcriptions?
        @record.has_transcription_enabled_questions? && (@user.is?(:superadmin) || @user.has_permission?(
          :results, :rescore_responses, project_id: project_id, campaign_id: campaign_id
        ))
      end

      def schedule_assessment?
        !@record.assessor_form? && can_manage_campaign_and_users?
      end

      def can_manage_campaign_and_users?
        has_permission?(:campaigns, :manage) && has_permission?(:campaigns, :manage_users)
      end
    end
  end
end
