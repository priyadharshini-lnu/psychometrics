# frozen_string_literal: true

module Mettl
  class FetchSingleProjectAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform(project_id)
      project = Client.projects.joins(:integrations).
                merge(Integration.mettl).
                find_by(id: project_id)

      if project
        assessments = Mettl::GetAssessments.call!(project)
        Mettl::SaveAssessments.call(project, assessments) if assessments.present?
      end
    end
  end
end
