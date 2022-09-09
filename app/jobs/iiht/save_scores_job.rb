# frozen_string_literal: true

module Iiht
  class SaveScoresJob < ApplicationJob
    queue_as :external_results

    retry_on StandardError, wait: ->(executions) { executions * 1.minute }, attempts: 3

    def perform(user_assessment)
      ::Iiht::SaveScores.call!(user_assessment)
    end
  end
end
