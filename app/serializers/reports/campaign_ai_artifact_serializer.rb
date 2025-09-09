# frozen_string_literal: true

module Reports
  class CampaignAIArtifactSerializer < Panko::Serializer
    attributes :id, :code, :name

    has_one :ai_assistant, serializer: AI::AssistantSerializer
  end
end
