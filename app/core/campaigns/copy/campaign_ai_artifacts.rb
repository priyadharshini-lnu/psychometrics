# frozen_string_literal: true

module Campaigns
  class Copy
    class CampaignAIArtifacts < BaseCommand
      def initialize(campaign, new_campaign)
        @campaign = campaign
        @new_campaign = new_campaign
      end

      def call
        @campaign.campaign_ai_artifacts.each do |artifact|
          new_artifact = artifact.dup
          new_artifact.campaign_id = @new_campaign.id
          new_artifact.save!

          copy_artifact_dependencies(artifact, new_artifact)
        end
      end

      private

      def copy_artifact_dependencies(original_artifact, new_artifact)
        original_artifact.dependencies.each do |dependency|
          new_dependency_record = resolve_dependency_for_new_campaign(dependency)
          next unless new_dependency_record

          new_artifact.dependencies.create!(
            dependency: new_dependency_record
          )
        end
      end

      def resolve_dependency_for_new_campaign(dependency)
        case dependency.dependency_type
          when 'Question'
            Question.find_by(id: dependency.dependency_id)
          when 'CampaignFactor'
            original_factor = CampaignFactor.find_by(id: dependency.dependency_id)
            return nil unless original_factor

            CampaignFactor.find_by(code: original_factor.code, campaign_id: @new_campaign.id)
          when 'SheetColumn'
            original_column = SheetColumn.find_by(id: dependency.dependency_id)
            return nil unless original_column

            find_sheet_column_in_new_campaign(original_column)
        end
      end

      def find_sheet_column_in_new_campaign(original_column)
        SheetColumn.joins(:sheet).where(
          sheets: { campaign_id: @new_campaign.id },
          name: original_column.name
        ).first
      end
    end
  end
end
