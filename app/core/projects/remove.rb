# frozen_string_literal: true

module Projects
  class Remove < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      simulation_user_assessment_exist = project.simulation_user_assessment_exist?

      ::Projects::RemoveOldCampaigns.call!(project)
      ::Projects::RemoveNewCampaigns.call!(project)

      if simulation_user_assessment_exist
        begin
          Simulation::DeleteParticipants.call!(project.id)
        rescue StandardError
          Rails.logger.info "Deleting simulation participants failed for Project #{project.id}"
        end
      end

      project.end_users.destroy_all
      project.destroy
      project.delete

      broadcast :ok
    end
  end
end
