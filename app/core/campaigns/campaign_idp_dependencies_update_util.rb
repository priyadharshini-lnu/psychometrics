# frozen_string_literal: true

module Campaigns
  class CampaignIdpDependenciesUpdateUtil < AIAssistantDependencyUtil
    def initialize(campaign_idp:, dependencies_params:)
      super(resource: campaign_idp, dependencies_params: dependencies_params)
    end

    private

    def extract_dependencies_from_params(value)
      (value['questions'] || []).map do |question_data|
        { dependency_type: 'Question', dependency_id: question_data['id'].to_i }
      end
    end
  end
end
