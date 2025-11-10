# frozen_string_literal: true

class Api::V2::Administration::Campaigns::AIArtifactResultResource < Api::V2::Administration::BaseResource
  model_name 'AI::CampaignArtifactResult'

  attributes :error, :artifact, :parsed_dependencies
  attribute :generated_at, delegate: :updated_at
  attribute :results, delegate: :schema_keys_result

  ransack_filters %i[filterable_fields]

  def artifact
    campaign_ai_artifact = @model.campaign_ai_artifact
    {
      id: campaign_ai_artifact.id,
      name: campaign_ai_artifact.name,
      code: campaign_ai_artifact.code
    }
  end

  def id
    # This is to ensure initialized object is also serialized even if it's not saved
    @model.id || "#{@model.campaign_ai_artifact_id}_#{@model.user_id}"
  end

  def self._type
    'campaign_ai_artifact_results'
  end
end
