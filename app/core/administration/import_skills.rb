# frozen_string_literal: true

module Administration
  class ImportSkills < BaseCommand
    REQUIRED_FIELDS = %w[ID Name Description].freeze
    REQUIRED_VALUES = %w[Name Description].freeze

    def initialize(file_url, project_id)
      @file_url = file_url.to_s
      @errors = []
      @project_id = project_id
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
        @errors << "Invalid CSV format: #{e.message}"
      end

      return @errors unless @errors.empty?

      true
    end

    private

    def download_file
      uri = URI.parse(@file_url)
      raise URI::InvalidURIError, 'Invalid URL format' unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)

      CSV.parse(uri.open, encoding: 'bom|utf-8')
    rescue URI::InvalidURIError => e
      @errors << "Invalid URL: #{e.message}"
      nil
    rescue OpenURI::HTTPError => e
      @errors << "Failed to download file: #{e.message}"
      nil
    rescue CSV::MalformedCSVError => e
      @errors << "Invalid CSV format: #{e.message}"
      nil
    rescue StandardError => e
      @errors << "Error downloading file: #{e.message}"
      nil
    end

    def process_csv_data(csv_data)
      headers = csv_data.shift
      validate_headers(headers)
      return if @errors.any?

      csv_data.each.with_index(2) do |row, line_number|
        row_data = headers.zip(row).to_h
        process_row(row_data, line_number)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      @errors << "Missing required columns: #{missing_fields.join(', ')}" if missing_fields.any?
    end

    def process_row(row, line_number)
      return unless validate_required_fields(row, line_number)

      skill = initialize_skill(row)
      assign_skill_attributes(skill, row)

      unless skill.save
        @errors << I18n.t(
          'administration.skills.errors.import.save_failed',
          line_number: line_number,
          name: row['Name'],
          message: skill.errors.full_messages.join(', ')
        )
      end
    end

    def validate_required_fields(row, line_number)
      missing_fields = REQUIRED_VALUES.select { |field| row[field].blank? }
      if missing_fields.any?
        @errors << "Line #{line_number}: Missing required fields (#{missing_fields.join(', ')})"
        return false
      end
      true
    end

    def initialize_skill(row)
      if row['ID'].present?
        Skill.find_by(id: row['ID']) || Skill.new
      else
        Skill.new
      end
    end

    def assign_skill_attributes(skill, row)
      attributes = {
        name: row['Name'],
        description: row['Description'],
        category: normalize_category(row['Category'])
      }
      attributes[:project_id] = @project_id if @project_id.present?

      skill.assign_attributes(attributes)
      assign_tags(skill, row)
    end

    def assign_tags(skill, row)
      return if row['Tag'].blank?

      skill.tag_list = row['Tag'].split(',').map(&:strip)
    end

    def normalize_category(category)
      return 'other' if category.blank?

      %w[behavioral technical other].include?(category.downcase) ? category.downcase : 'other'
    end
  end
end
