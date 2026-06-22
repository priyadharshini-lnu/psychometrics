# frozen_string_literal: true

module Reports
  class UpdateCampaignAIArtifacts < BaseCommand
    class InvalidArtifactParams < StandardError; end
    class TooManyCampaignAIArtifacts < StandardError; end

    MAX_CAMPAIGN_AI_ARTIFACTS =  ::AI::CampaignArtifact::MAX_CAMPAIGN_AI_ARTIFACTS

    private_attr_reader :report, :campaign_ai_artifacts_params

    def initialize(report, campaign_ai_artifacts_params)
      @report = report
      @campaign_ai_artifacts_params = campaign_ai_artifacts_params

      validate_params!
      validate_ai_assistant_existence!
      validate_campaign_ai_artifacts_limit!
    end

    def call
      ActiveRecord::Base.transaction do
        remove_unused_artifacts
        update_campaign_ai_artifacts!
        clean_module_references
      end
    end

    private

    def validate_params!
      return if campaign_ai_artifacts_params.is_a?(Array) &&
                campaign_ai_artifacts_params.all? { |a| valid_artifact?(a) }

      raise InvalidArtifactParams, I18n.t('administration.report_builder.campaign_ai_artifacts.invalid_artifact_params')
    end

    def validate_campaign_ai_artifacts_limit!
      total_artifacts = new_artifact_codes.size
      return if total_artifacts <= MAX_CAMPAIGN_AI_ARTIFACTS

      raise TooManyCampaignAIArtifacts,
            I18n.t('administration.report_builder.campaign_ai_artifacts.too_many_artifacts',
                   count: MAX_CAMPAIGN_AI_ARTIFACTS)
    end

    def valid_artifact?(artifact)
      %w[code name].all? { |key| artifact[key].present? } &&
        artifact['ai_assistant']&.dig('id').present?
    end

    def validate_ai_assistant_existence!
      ids = campaign_ai_artifacts_params.map { |a| a.dig('ai_assistant', 'id').to_i }.uniq
      found_ids = AI::Assistant.where(id: ids).pluck(:id)
      missing_ids = ids - found_ids
      if missing_ids.any?
        raise InvalidArtifactParams, "AI Assistant(s) not found for id(s): #{missing_ids.join(', ')}"
      end
    end

    def remove_unused_artifacts
      removed_codes = existing_artifact_codes - new_artifact_codes
      report.campaign_ai_artifacts.where(code: removed_codes).delete_all
      @removed_codes = removed_codes
    end

    def update_campaign_ai_artifacts!
      artifacts = campaign_ai_artifacts_params.map do |artifact_params|
        {
          code: artifact_params['code'],
          name: artifact_params['name'],
          ai_assistant_id: artifact_params.dig('ai_assistant', 'id'),
          report_id: report.id,
          tenant_id: report.tenant_id
        }
      end

      Reports::CampaignAIArtifact.import(
        artifacts,
        on_duplicate_key_update: { conflict_target: %i[code report_id], columns: %i[name ai_assistant_id] },
        validate: false
      )
    end

    def clean_module_references
      campaign_ai_artifact_modules.each do |mod|
        next unless mod.props.dig('source', 'codes').is_a?(Array)

        mod.props['source']['codes'] -= @removed_codes
        mod.save
      end
    end

    def campaign_ai_artifact_modules
      Reports::Module.joins(:page).
        where(reports_pages: { report_id: report.id }).
        where("reports_modules.props -> 'source' ->> 'type' = 'CampaignAIArtifacts'")
    end

    def existing_artifact_codes
      @existing_artifact_codes ||= report.campaign_ai_artifacts.pluck(:code)
    end

    def new_artifact_codes
      @new_artifact_codes ||= campaign_ai_artifacts_params.pluck('code')
    end
  end
end
