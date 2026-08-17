# frozen_string_literal: true

module AdminJobs
  class ImportCampaignTranslationsJob < AdminJobs::Base
    def call
      result = Administration::ImportCampaignTranslations.new(record.file, record.data['project_id']).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{Array(result).join(', ')}"
      end
    end
  end
end
