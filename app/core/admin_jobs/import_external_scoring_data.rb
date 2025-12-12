# frozen_string_literal: true

module AdminJobs
  class ImportExternalScoringData < AdminJobs::Base
    def call
      import_result = Yoodli::ImportExternalResults.call(file: record.file, campaign: campaign)

      if import_result[:success]
        broadcast :ok
      else
        broadcast :ok, {
          error_messages: import_result[:errors]
        }
      end
    rescue StandardError => e
      broadcast :ok, {
        error_messages: ["Import failed: #{e.message}"]
      }
    end

    def valid?
      campaign.present?
    end

    def generate_details
      [[I18n.t('admin.import_external_scoring_data_title'), I18n.t('admin.import_external_scoring_data_description')]]
    end

    private

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end
  end
end
