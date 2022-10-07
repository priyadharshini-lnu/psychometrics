# frozen_string_literal: true

require 'xmlsimple'

module Pearson
  class SaveScoresAndReportsJob < ApplicationJob
    queue_as :external_results

    retry_on StandardError, wait: ->(executions) { executions * 1.minute }, attempts: 3

    def perform(user_assessment)
      Pearson::SaveScoresAndReports.call!(user_assessment)
    end
  end
end
