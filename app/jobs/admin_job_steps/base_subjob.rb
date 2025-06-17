# frozen_string_literal: true

module AdminJobSteps
  class BaseSubjob < ApplicationJob
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    queue_as :low_priority
    track_job_run

    def perform(job_record)
      raise NotImplementedError, 'Subclasses must implement the perform method'
    end

    def content
      []
    end
  end
end
