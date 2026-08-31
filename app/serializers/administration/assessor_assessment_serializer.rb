# frozen_string_literal: true

module Administration
  class AssessorAssessmentSerializer < Panko::Serializer
    attributes :id, :name, :permissions, :linked_assessment_name, :owner, :tenant,
               :dimension_id, :tenant_id

    delegate :dimension_id, to: :object

    delegate :tenant_id, to: :object

    def owner
      return unless object.owner

      { id: object.owner.id, name: object.owner.name }
    end

    def tenant
      owner
    end

    delegate :name, :id, to: :linked_assessment, prefix: true, allow_nil: true
    delegate :linked_assessment, to: :object

    def permissions
      GetPermissionsHash.call!(
        Administration::CampaignAssessmentPolicy,
        current_user,
        object,
        %w[
          import_results
          export_raw_results
          export_scoring_results
          export_raw_factor_scores
          export_normed_results
          export_external_results
          rescore_responses
        ],
        {
          project_id: context[:project_id],
          campaign_id: context[:campaign_id]
        }
      )
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
