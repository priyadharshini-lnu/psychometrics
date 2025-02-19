# frozen_string_literal: true

module DataReports::FieldHandlers
  class CampaignDetailHandler < ::DataReports::BaseFieldHandler
    ALLOWED_FIELD_NAMES = %w[campaign_name campaign_id].freeze

    def call
      return :ok, nil if ALLOWED_FIELD_NAMES.exclude?(field['field_name'])

      broadcast :ok, send(field['field_name'])
    end

    private

    def campaign_name
      cu.campaign.name
    end

    def campaign_id
      cu.campaign.id
    end
  end
end
