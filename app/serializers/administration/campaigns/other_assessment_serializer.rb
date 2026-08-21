# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherAssessmentSerializer < Panko::Serializer
      attributes :id, :name, :category, :permissions, :owner, :dimension_id, :tenant_id

      delegate :dimension_id, to: :object

      def owner
        return unless object.owner

        { id: object.owner.id, name: object.owner.name }
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::CampaignAssessmentPolicy,
          context[:current_user],
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
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      end
    end
  end
end
