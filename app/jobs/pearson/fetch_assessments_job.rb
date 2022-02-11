# frozen_string_literal: true

module Pearson
  class FetchAssessmentsJob < ApplicationJob
    queue_as :low_priority

    def perform
      Pearson::GetAssessments.call!
    end
  end
end
