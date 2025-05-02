# frozen_string_literal: true

module Administration
  class ImportSkillTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID Locale Name Description].freeze

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
        @errors << I18n.t('administration.skills.translations.import.errors.invalid_csv_format',
                          message: e.message)
      end

      @errors.any? ? @errors : true
    end

    private

    def download_file
      uri = URI.parse(@file_url)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        raise URI::InvalidURIError,
              I18n.t('administration.skills.translations.import.errors.invalid_url_format')
      end

      CSV.parse(uri.open, headers: true, encoding: 'bom|utf-8')
    rescue URI::InvalidURIError => e
      @errors << I18n.t('administration.skills.translations.import.errors.invalid_url',
                        message: e.message)
      nil
    rescue OpenURI::HTTPError => e
      @errors << I18n.t('administration.skills.translations.import.errors.download_failed',
                        message: e.message)
      nil
    end

    def process_csv_data(csv_data)
      validate_headers(csv_data.headers)
      return if @errors.any?

      csv_data.each do |row|
        process_row(row)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      if missing_fields.any?
        @errors << I18n.t('administration.skills.translations.import.errors.missing_columns',
                          fields: missing_fields.join(', '))
      end
    end

    def process_row(row)
      row_data = row.to_h.transform_values do |value|
        Utility::String.remove_csv_injection_marker(value.to_s.strip)
      end

      process_translation(row_data)
    end

    def process_translation(row_data)
      skill = Skill.find_by(id: row_data['ID'], project_id: @project_id)
      unless skill
        @errors << I18n.t('administration.skills.translations.import.errors.skill_not_found',
                          id: row_data['ID'])
        return
      end

      locale = row_data['Locale'].to_sym
      Mobility.with_locale(locale) do
        skill.update!(
          name: row_data['Name'],
          description: row_data['Description']
        )
      end
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.skills.translations.import.errors.save_failed',
                        message: e.message)
    end
  end
end
