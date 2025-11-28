# frozen_string_literal: true

module AdminJobs
  class ExportCampaignAIArtifactsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.campaign_ai_artifacts.export.details'), file_link]]
    end

    def headers
      %w[
        ID
        Code
        Name
        AIAssistantID
        AIAssistantName
        Instructions
        IncludeAllDatasheetColumns
        DependencyQuestionIDs
        DependencyCampaignFactorCodes
        DependencySheetColumnNames
      ]
    end

    def records_for_export
      campaign_id = record.data['campaign_id']
      AI::CampaignArtifact.where(campaign_id: campaign_id).includes(:dependencies, :ai_assistant)
    end

    def data_row(artifact)
      question_ids = artifact.dependencies.where(dependency_type: 'Question').pluck(:dependency_id)
      campaign_factor_codes = fetch_campaign_factor_codes(artifact)
      sheet_column_names = fetch_sheet_column_names(artifact)

      [
        [
          artifact.id,
          artifact.code,
          artifact.name,
          artifact.ai_assistant_id,
          artifact.ai_assistant&.name,
          artifact.instructions,
          artifact.include_all_datasheet_columns,
          question_ids.join(', '),
          campaign_factor_codes.join(', '),
          sheet_column_names.join(', ')
        ]
      ]
    end

    def fetch_campaign_factor_codes(artifact)
      campaign_factor_ids = artifact.dependencies.where(dependency_type: 'CampaignFactor').pluck(:dependency_id)
      return [] if campaign_factor_ids.empty?

      CampaignFactor.where(id: campaign_factor_ids).pluck(:code)
    end

    def fetch_sheet_column_names(artifact)
      sheet_column_ids = artifact.dependencies.where(dependency_type: 'SheetColumn').pluck(:dependency_id)
      return [] if sheet_column_ids.empty?

      SheetColumn.where(id: sheet_column_ids).pluck(:name)
    end

    def file_name
      campaign = Campaign.find_by(id: record.data['campaign_id'])
      campaign&.name ? "#{campaign.name}-ai-artifacts.csv" : 'campaign-ai-artifacts.csv'
    end
  end
end
