# frozen_string_literal: true

module Administration
  class ImportCampaignTranslations < BaseCommand
    include CampaignTranslationCsvHelpers

    ID_FIELD = 'Campaign ID'
    REQUIRED_FIELDS = [ID_FIELD].freeze

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    def call
      normalized_rows.each_with_index do |row, index|
        process_row(row, index + 2)
      end

      true
    end

    private

    def csv_data
      @csv_data ||= @file.open do |file_io|
        file_io.binmode if file_io.respond_to?(:binmode)
        ::CsvFileParser.call!(file_io, headers: true)
      end
    end

    def process_row(row, row_number)
      campaign_id = value_for(row, ID_FIELD)
      campaign = Campaign.find_by(id: campaign_id, project_id: @project_id)

      unless campaign
        raise Errors::ImportError,
              I18n.t('administration.campaigns.bulk_import_translations.errors.campaign_not_found',
                     id: campaign_id, row: row_number)
      end

      locale_headers.each do |header|
        locale = locale_for_header(header)
        next if locale.blank?

        translation = value_for(row, header)
        next if translation.blank?

        Mobility.with_locale(locale) do
          campaign.update!(name: translation)
        rescue ActiveRecord::RecordInvalid => e
          raise Errors::ImportError,
                I18n.t(
                  'administration.campaigns.bulk_import_translations.errors.save_failed',
                  id: campaign_id,
                  locale: locale,
                  message: e.message
                )
        end
      end
    end
  end
end
