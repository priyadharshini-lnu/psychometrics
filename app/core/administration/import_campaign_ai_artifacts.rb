# frozen_string_literal: true

module Administration
  class ImportCampaignAIArtifacts < BaseCommand
    REQUIRED_FIELDS = %w[Code Name AIAssistantID].freeze
    OPTIONAL_FIELDS = %w[
      ID AIAssistantName Instructions IncludeAllDatasheetColumns
      DependencyQuestionIDs DependencyCampaignFactorCodes DependencySheetColumnNames
    ].freeze

    def initialize(file, campaign_id)
      @file = file
      @campaign_id = campaign_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file, headers: true)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def process_csv_data(csv_data)
      csv_data.each do |row|
        process_campaign_ai_artifact(row.to_h)
      end
    end

    def process_campaign_ai_artifact(row_data)
      validate_ai_assistant(row_data['AIAssistantID'])

      artifact = AI::CampaignArtifact.find_or_initialize_by(code: row_data['Code'], campaign_id: @campaign_id)

      artifact.campaign_id = @campaign_id
      artifact.name = row_data['Name']
      artifact.ai_assistant_id = row_data['AIAssistantID'].to_i
      artifact.instructions = row_data['Instructions']
      artifact.include_all_datasheet_columns = parse_boolean(row_data['IncludeAllDatasheetColumns'])

      artifact.save!

      update_dependencies(artifact, row_data)
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError,
            I18n.t('administration.campaign_ai_artifacts_import.errors.save_failed',
                   code: row_data['Code'], message: e.message)
    end

    def validate_ai_assistant(ai_assistant_id)
      return if AI::Assistant.exists?(ai_assistant_id)

      raise Errors::ImportError,
            I18n.t('administration.campaign_ai_artifacts_import.errors.ai_assistant_not_found',
                   id: ai_assistant_id)
    end

    def parse_json_field(value)
      return [] if value.blank?

      JSON.parse(value)
    rescue JSON::ParserError
      []
    end

    def parse_boolean(value)
      return false if value.blank?

      %w[true 1 yes].include?(value.to_s.downcase)
    end

    def update_dependencies(artifact, row_data)
      artifact.dependencies.destroy_all

      create_question_dependencies(artifact, row_data['DependencyQuestionIDs'])
      create_campaign_factor_dependencies(artifact, row_data['DependencyCampaignFactorCodes'])
      create_sheet_column_dependencies(artifact, row_data['DependencySheetColumnNames'])
    end

    def create_question_dependencies(artifact, ids_string)
      return if ids_string.blank?

      ids = ids_string.to_s.split(',').map(&:strip).compact_blank.map(&:to_i).uniq

      ids.each do |dependency_id|
        unless Question.exists?(dependency_id)
          raise Errors::ImportError,
                I18n.t('administration.campaign_ai_artifacts_import.errors.dependency_not_found',
                       type: 'Question', id: dependency_id)
        end

        artifact.dependencies.create!(
          dependency_type: 'Question',
          dependency_id: dependency_id
        )
      end
    end

    def create_campaign_factor_dependencies(artifact, codes_string)
      return if codes_string.blank?

      codes = codes_string.to_s.split(',').map(&:strip).compact_blank.uniq

      codes.each do |code|
        campaign_factor = CampaignFactor.find_by(code: code, campaign_id: @campaign_id)
        unless campaign_factor
          raise Errors::ImportError,
                I18n.t('administration.campaign_ai_artifacts_import.errors.campaign_factor_not_found',
                       code: code)
        end

        artifact.dependencies.create!(dependency: campaign_factor)
      end
    end

    def create_sheet_column_dependencies(artifact, names_string)
      return if names_string.blank?

      names = names_string.to_s.split(',').map(&:strip).compact_blank.uniq

      names.each do |column_name|
        sheet_column = find_sheet_column_by_name(column_name)
        unless sheet_column
          raise Errors::ImportError,
                I18n.t('administration.campaign_ai_artifacts_import.errors.sheet_column_not_found',
                       name: column_name)
        end

        artifact.dependencies.create!(dependency: sheet_column)
      end
    end

    def find_sheet_column_by_name(column_name)
      campaign = Campaign.find(@campaign_id)

      campaign_sheet_column = SheetColumn.joins(:sheet).
                              where(sheets: { campaign_id: @campaign_id }).
                              find_by(name: column_name)
      return campaign_sheet_column if campaign_sheet_column

      SheetColumn.joins(:sheet).
        where(sheets: { project_id: campaign.project_id, campaign_id: nil }).
        find_by(name: column_name)
    end
  end
end
