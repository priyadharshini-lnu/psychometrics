# frozen_string_literal: true

module Mettl
  class FetchAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform
      Client.projects.joins(:integrations).merge(Integration.mettl.active).each do |project|
        assessments = Mettl::GetAssessments.call!(project)
        Mettl::SaveAssessments.call(project, assessments) if assessments.present?
      end
    end
  end
end
