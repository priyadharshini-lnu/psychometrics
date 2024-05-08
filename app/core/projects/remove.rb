# frozen_string_literal: true

module Projects
  class Remove < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      ::Projects::RemoveOldCampaigns.call!(project)
      ::Projects::RemoveNewCampaigns.call!(project)
      project.end_users.destroy_all
      project.destroy
      project.delete

      broadcast :ok
    end
  end
end
