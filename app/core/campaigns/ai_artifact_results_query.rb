# frozen_string_literal: true

module Campaigns
  class AIArtifactResultsQuery < Rectify::Query
    private_attr_reader :campaign_id, :user_id

    def initialize(campaign_id, user_id)
      @campaign_id = campaign_id
      @user_id = user_id
    end

    def query
      AI::CampaignArtifactResult.
        joins(:campaign_ai_artifact).
        where(
          user_id: user_id,
          campaign_ai_artifacts: { campaign_id: campaign_id }
        ).
        where(error: nil).
        includes(campaign_ai_artifact: :assistant_output_schema_keys)
    end
  end
end
