# frozen_string_literal: true

module Iiht
  class FetchAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform
      Client.projects.joins(:integrations).merge(Integration.iiht.active).each do |project|
        Iiht::GetAssessments.call!(project)
      end
    end
  end
end
