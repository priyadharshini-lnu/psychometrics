# frozen_string_literal: true

module AI
  class CampaignArtifactResultSerializer < Panko::Serializer
    attributes :code, :name, :results

    def code
      object.campaign_ai_artifact.code
    end

    def name
      object.campaign_ai_artifact.name
    end

    def results
      object.schema_keys_result
    end
  end
end
