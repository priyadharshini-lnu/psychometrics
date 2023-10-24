# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :name, :category, :permissions

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignAssessmentPolicy,
          instance_options[:current_user],
          object,
          %w[
            import_results
            export_raw_results
            export_scoring_results
            export_raw_factor_scores
            export_normed_results
            export_external_results
            rescore_responses
            update_external_config
            schedule_assessment
          ],
          {
            project_id: instance_options[:project_id],
            campaign_id: instance_options[:campaign_id]
          }
        )
      end
    end
  end
end
