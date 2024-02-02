# frozen_string_literal: true

module Projects
  class LastPreworkCompletedAt < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      results =
        UserAssessment.joins(:campaign).preworks(true).completed.
        select(
          'user_assessments.campaign_id', 'user_assessments.subject_id',
          'MAX(user_assessments.completed_at) as completed_at'
        ).
        group('user_assessments.campaign_id', 'user_assessments.subject_id').
        where(campaigns: { project_id: project.id }).
        each_with_object({}) { |ua, hash| hash[[ua.campaign_id, ua.subject_id]] = ua.completed_at }

      broadcast :ok, results
    end
  end
end
