# frozen_string_literal: true

module Projects
  class RemoveOldCampaigns < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      Client.campaigns_of(project.id).each(&:destroy!)
      Rails.logger.info "Project #{project.id} Old campaigns - Deleted"

      broadcast :ok
    end
  end
end
