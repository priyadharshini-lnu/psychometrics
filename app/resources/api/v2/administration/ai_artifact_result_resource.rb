# frozen_string_literal: true

# This file is not being used, but if we remove this it causes exception due to json-resource gem checking for this file
class Api::V2::Administration::AIArtifactResultResource < Api::V2::Administration::BaseResource
  model_name 'AI::CampaignArtifactResult'
end
