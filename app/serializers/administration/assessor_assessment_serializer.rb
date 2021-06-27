# frozen_string_literal: true

module Administration
  class AssessorAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :permissions

    def permissions
      GetPermissionsHash.call!(
        Administration::CampaignAssessmentPolicy,
        {
          user: current_user,
          project_id: campaign.project_id
        },
        object,
        %w[
          import_results
          export_raw_results
          export_scoring_results
          export_raw_factor_scores
          export_normed_results
          export_external_results
          rescore_responses
        ]
      )
    end

    private

    def current_user
      instance_options[:current_user]
    end

    def campaign
      instance_options[:campaign]
    end
  end
end
