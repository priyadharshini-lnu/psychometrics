# frozen_string_literal: true

module AdminJobs
  class ImportDevelopmentActionsJob < AdminJobs::Base
    def call
      Administration::ImportDevelopmentActions.new(
        record.file,
        record.data['project_id']
      ).call

      broadcast :ok
    end
  end
end
