# frozen_string_literal: true

module AdminJobs
  class ImportDevelopmentActionTranslationsJob < AdminJobs::Base
    def call
      result = Administration::ImportDevelopmentActionTranslations.new(
        record.file,
        record.data['project_id']
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end
  end
end
