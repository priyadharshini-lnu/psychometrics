# frozen_string_literal: true

module Campaigns
  class AIArtifactDependenciesUpdateUtil < AIAssistantDependencyUtil
    def initialize(ai_artifact:, dependencies_params:)
      super(resource: ai_artifact, dependencies_params: dependencies_params)
    end

    private

    def extract_dependencies_from_params(value)
      dependencies = []

      (value['campaign_factors'] || []).each do |factor_data|
        next unless factor_data['id']

        dependencies << { dependency_type: 'CampaignFactor', dependency_id: factor_data['id'].to_i }
      end

      (value['questions'] || []).each do |question_data|
        dependencies << { dependency_type: 'Question', dependency_id: question_data['id'].to_i }
      end

      (value['sheet_columns'] || []).each do |column_data|
        next unless column_data['id']

        dependencies << { dependency_type: 'SheetColumn', dependency_id: column_data['id'].to_i }
      end

      dependencies
    end
  end
end
