# frozen_string_literal: true

module Hogan
  class LoadResultsJob < ApplicationJob
    queue_as :default

    def perform(assign, membership_with_result, project)
      assign.original_or_self.reports.select(&:hogan?).each do |report|
        Hogan::LoadResults.call!(assign, report, membership_with_result, project)
      end
    end
  end
end
