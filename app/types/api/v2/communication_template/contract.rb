# frozen_string_literal: true

module Api
  module V2
    module CommunicationTemplate
      class Contract < Api::Base::Contract
        rule(:data) do
          level = values.dig(:data, :attributes, :level)
          client_id = values.dig(:data, :relationships, :client, :data, :id)
          project_id = values.dig(:data, :relationships, :project, :data, :id)
          campaign_id = values.dig(:data, :relationships, :campaign, :data, :id)

          validate_scope_for_level(level, client_id, project_id, campaign_id)
          validate_hierarchy(client_id, project_id, campaign_id)
        end

        private

        def validate_scope_for_level(level, client_id, project_id, campaign_id)
          case level
            when 'platform' then validate_platform_scope(client_id, project_id, campaign_id)
            when 'client' then validate_client_scope(client_id, project_id, campaign_id)
            when 'project' then validate_project_scope(project_id, campaign_id)
            when 'campaign' then validate_campaign_scope(campaign_id)
          end
        end

        def validate_platform_scope(client_id, project_id, campaign_id)
          return if client_id.blank? && project_id.blank? && campaign_id.blank?

          key.failure('platform level cannot include client, project, or campaign scope')
        end

        def validate_client_scope(client_id, project_id, campaign_id)
          key.failure('client level requires client relationship') if client_id.blank?
          key.failure('client level cannot include project or campaign scope') if
            project_id.present? || campaign_id.present?
        end

        def validate_project_scope(project_id, campaign_id)
          key.failure('project level requires project relationship') if project_id.blank?
          key.failure('project level cannot include campaign scope') if campaign_id.present?
        end

        def validate_campaign_scope(campaign_id)
          key.failure('campaign level requires campaign relationship') if campaign_id.blank?
        end

        def validate_hierarchy(client_id, project_id, campaign_id)
          validate_project_belongs_to_client(client_id, project_id)
          validate_campaign_belongs_to_project(project_id, campaign_id)
        end

        def validate_project_belongs_to_client(client_id, project_id)
          return if client_id.blank? || project_id.blank?

          project = ::Client.find_by(id: project_id)
          key.failure('project must belong to client') if project.blank? || project.parent_id != client_id.to_i
        end

        def validate_campaign_belongs_to_project(project_id, campaign_id)
          return if project_id.blank? || campaign_id.blank?

          campaign = ::Campaign.find_by(id: campaign_id)
          key.failure('campaign must belong to project') if campaign.blank? || campaign.project_id != project_id.to_i
        end
      end
    end
  end
end
