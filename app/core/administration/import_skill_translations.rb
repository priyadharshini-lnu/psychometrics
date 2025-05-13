# frozen_string_literal: true

module Administration
  class ImportSkillTranslations < BaseCommand
    REQUIRED_FIELDS = %w[ID].freeze

    def initialize(file_url, project_id)
      @file_url = file_url.to_s
      @project_id = project_id
      @errors = []
    end

    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/PerceivedComplexity
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

      header_locale_map = build_header_locale_map(csv_data.headers)
      grouped_rows = group_rows_by_skill_and_field(csv_data)

      grouped_rows.each do |skill_id, field_data|
        process_skill_translations(skill_id, field_data, header_locale_map)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      if missing_fields.any?
        @errors << I18n.t('administration.skills.translations.import.errors.missing_columns',
                          columns: missing_fields.join(', '))
      end
    end

    def build_header_locale_map(headers)
      headers.each_with_object({}) do |header, map|
        next if header == 'ID'

        # Format is expected to be like "English / en" where "en" is the locale code
        locale = header.split(' / ').last
        map[header] = locale if locale
      end
    end

    def group_rows_by_skill_and_field(csv_data)
      grouped_data = {}

      csv_data.each do |row|
        row_data = row.to_h.transform_values do |value|
          Utility::String.remove_csv_injection_marker(value.to_s.strip)
        end

        id_field = row_data['ID']
        next unless id_field

        # Format is expected to be like "123#Name" or "123#Description"
        parts = id_field.split('#')
        next unless parts.size == 2

        skill_id = parts[0]
        field_type = parts[1]

        grouped_data[skill_id] ||= {}
        grouped_data[skill_id][field_type] = row_data
      end

      grouped_data
    end

    def process_skill_translations(skill_id, field_data, header_locale_map)
      skill = Skill.find_by(id: skill_id, project_id: @project_id)
      unless skill
        @errors << I18n.t('administration.skills.translations.import.errors.skill_not_found',
                          id: skill_id)
        return
      end

      header_locale_map.each do |header, locale|
        next if locale.blank?

        name = field_data['Name']&.[](header)
        description = field_data['Description']&.[](header)

        next if name.blank? && description.blank?

        Mobility.with_locale(locale) do
          skill.update!(
            name: name.presence || skill.name,
            description: description.presence || skill.description
          )
        rescue ActiveRecord::RecordInvalid => e
          @errors << I18n.t('administration.skills.translations.import.errors.save_failed',
                            message: e.message)
        end
      end
    end
  end
end
# rubocop:enable Metrics/CyclomaticComplexity
# rubocop:enable Metrics/PerceivedComplexity
