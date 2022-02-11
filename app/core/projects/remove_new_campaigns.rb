# frozen_string_literal: true

module Projects
  class RemoveNewCampaigns < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      project.project_campaigns.map(&:destroy!)
      Rails.logger.info "Project #{project.id} New campaigns - Deleted"

      broadcast :ok
    end
  end
end
