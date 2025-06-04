# frozen_string_literal: true

module Skillvue
  class FetchAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform(project_id)
      project = Client.projects.joins(:integrations).
                merge(Integration.skillvue).
                find_by(id: project_id)

      if project
        assessments = Skillvue::GetAssessments.call!(project)
        Skillvue::SaveAssessments.call(project, assessments) if assessments.present?
      end
    end
  end
end
