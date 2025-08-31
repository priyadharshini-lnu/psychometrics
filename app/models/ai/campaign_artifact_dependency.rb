# frozen_string_literal: true

class AI::CampaignArtifactDependency < ApplicationRecord
  self.table_name = 'campaign_ai_artifact_dependencies'

  belongs_to :campaign_ai_artifact, class_name: 'AI::CampaignArtifact'
  belongs_to :dependency, polymorphic: true

  validates :dependency, presence: true
  validates :campaign_ai_artifact_id, uniqueness: { scope: %i[dependency_type dependency_id] }
end
