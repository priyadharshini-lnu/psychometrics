# frozen_string_literal: true

module Microsite
  class FetchAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform(project_id)
      project = Client.projects.joins(:integrations).
                merge(Integration.microsite).
                find_by(id: project_id)

      if project
        assessments = Microsite::GetAssessments.call!(project)
        Microsite::SaveAssessments.call(project, assessments) if assessments.present?
      end
    end
  end
end
