# frozen_string_literal: true

class AI::CampaignArtifactDependency < ApplicationRecord
  self.table_name = 'campaign_ai_artifact_dependencies'

  belongs_to :campaign_ai_artifact, class_name: 'AI::CampaignArtifact'
  belongs_to :dependency, polymorphic: true
  include Tenantable

  tenant_source :campaign_ai_artifact

  validates :dependency, presence: true
  validates :campaign_ai_artifact_id, uniqueness: { scope: %i[dependency_type dependency_id] }

  after_commit :update_artifact_checksum, on: %i[create destroy]

  private

  def update_artifact_checksum
    campaign_ai_artifact&.recalculate_dependencies_checksum!
  end
end
