# frozen_string_literal: true

module UserReports
  class GeneratePdfJob < ApplicationJob
    queue_as :reports

    def perform(resource, current_user, options = {})
      ::UserReports::GeneratePdf.call!(resource, current_user, options)
    end
  end
end
