# frozen_string_literal: true

module Users
  class BuildRolesWithLinks < BaseCommand
    attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      roles =
        if user.role == 'Users::Regular'
          build_for_regular_user
        else
          build_for_superadmin +
            build_for_client_admins +
            build_for_project_admins +
            build_for_campaign_admins +
            build_for_client_assessors +
            build_for_campaign_assessor
        end

      broadcast :ok, roles
    end

    def build_for_client_assessors
      assessor_client_ids = user.assessors.includes(campaign: { project: :client }).map do |assessor|
        assessor.campaign.project.client.id
      end.uniq

      user.client_assessor_clients.uniq(&:id).reject do |client|
        assessor_client_ids.include?(client.id)
      end.map do |client|
        {
          name: 'client_assessor',
          paths: [
            { name: client.name, value: "/admin/clients/#{client.id}/projects" }
          ]
        }
      end
    end

    def build_for_campaign_assessor
      assessors = user.assessors.includes(campaign: { project: :client })
      assessors.map do |assessor|
        campaign = assessor.campaign
        project = campaign.project
        client = project.client

        {
          name: 'campaign_assessor',
          paths: [
            { name: client.name, value: "/admin/clients/#{client.id}/projects" },
            { name: project.name, value: "/admin/projects/#{project.id}/new_campaigns" },
            { name: campaign.name,
              value: "/admin/projects/#{project.id}/new_campaigns/#{assessor.campaign.id}/participants/assessors" }
          ]
        }
      end
    end

    def build_for_regular_user
      user.campaigns.map { |campaign| build_for_campaign(campaign, 'campaign_user') }
    end

    def build_for_superadmin
      user.superadmin? ? [{ name: 'superadmin', paths: [] }] : []
    end

    def build_for_client_admins
      user.client_admin_clients.map do |client|
        {
          name: 'client_admin', paths: [
            { name: client.name, value: "/admin/clients/#{client.id}/projects" }
          ]
        }
      end
    end

    def build_for_project_admins
      user.project_admin_clients.map do |project|
        {
          name: 'project_admin',
          paths: [
            { name: project.client.name, value: "/admin/clients/#{project.client.id}/projects" },
            { name: project.name, value: "/admin/projects/#{project.id}/new_campaigns" }
          ]
        }
      end
    end

    def build_for_campaign_admins
      user.campaign_admin_campaigns.map { |campaign| build_for_campaign(campaign, 'campaign_admin') }
    end

    def build_for_campaign(campaign, name)
      project = campaign.project
      client = project.client
      {
        name: name,
        paths: [
          { name: client.name, value: "/admin/clients/#{client.id}/projects" },
          { name: project.name, value: "/admin/projects/#{project.id}/new_campaigns" },
          { name: campaign.name, value: build_campaign_url(project, campaign, name) }
        ]
      }
    end

    def build_campaign_url(project, campaign, name)
      url = "/admin/projects/#{project.id}/new_campaigns/#{campaign.id}"
      url += '/admins' if name == 'campaign_admin'
      url # return the generated URL
    end
  end
end
