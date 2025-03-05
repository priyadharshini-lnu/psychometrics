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
        @record.common? && (@user.is?(:superadmin) || @user.has_permission?(
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

      def schedule_assessment?
        !@record.assessor_form? &&
          has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
      end
    end
  end
end
