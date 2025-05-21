# frozen_string_literal: true

module Administration
  class ImportDevelopmentActionTranslations < BaseCommand
    def initialize(file_url, project_id)
      @file_url = file_url.to_s
      @project_id = project_id
      @errors = []
    end

    def call
      begin
        csv_data = download_file
        return @errors if @errors.any?

        ActiveRecord::Base.transaction do
          process_csv_data(csv_data)
          raise ActiveRecord::Rollback if @errors.any?
        end
      rescue CSV::MalformedCSVError => e
        @errors << I18n.t('administration.development_action_translations.import.errors.invalid_csv_format',
                          message: e.message)
      end

      @errors.any? ? @errors : true
    end

    private

    def download_file
      uri = URI.parse(@file_url)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        raise URI::InvalidURIError,
              I18n.t('administration.development_action_translations.import.errors.invalid_url_format')
      end

      CSV.parse(uri.open, headers: true, encoding: 'bom|utf-8')
    rescue URI::InvalidURIError => e
      @errors << I18n.t('administration.development_action_translations.import.errors.invalid_url',
                        message: e.message)
      nil
    rescue OpenURI::HTTPError => e
      @errors << I18n.t('administration.development_action_translations.import.errors.download_failed',
                        message: e.message)
      nil
    end

    def process_csv_data(csv_data)
      process_by_rows(csv_data)
    end

    def process_by_rows(csv_data)
      grouped_rows = {}

      csv_data.each do |row|
        row_hash = row.to_h
        id_with_field = row_hash['ID'].to_s
        next unless id_with_field.include?('#')

        id, field = id_with_field.split('#', 2)
        grouped_rows[id] ||= {}
        grouped_rows[id][field] = row_hash.except('ID')
      end

      grouped_rows.each do |id, fields|
        process_development_action(id, fields)
      end
    end

    def process_development_action(id, fields)
      development_action = DevelopmentAction.find_by(id: id, project_id: @project_id)
      unless development_action
        @errors << I18n.t('administration.development_action_translations.import.errors.development_action_not_found',
                          id: id,
                          project_id: @project_id)
        return
      end

      name_fields = fields['Name'] || {}
      description_fields = fields['Description'] || {}

      name_fields.each do |header, value|
        locale = extract_locale_from_header(header)
        next unless locale

        update_translation(development_action, locale, value, description_fields[header])
      end
    end

    def extract_locale_from_header(header)
      # Headers are in format "Language Name / locale_code"
      header.split(' / ').last&.to_sym
    rescue StandardError
      nil
    end

    def update_translation(development_action, locale, name, description)
      return if name.blank? && description.blank?

      cleaned_name = Utility::String.remove_csv_injection_marker(name.to_s.strip)
      cleaned_description = Utility::String.remove_csv_injection_marker(description.to_s.strip) if description

      Mobility.with_locale(locale) do
        development_action.update!(
          name: cleaned_name.presence || development_action.name,
          description: cleaned_description.presence || development_action.description
        )
      end
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.development_action_translations.import.errors.save_failed',
                        message: e.message)
    end
  end
end
