# frozen_string_literal: true

module Administration
  class ImportSkills < BaseCommand
    REQUIRED_FIELDS = %w[ID Name Description Project].freeze

    def initialize(file_url, ignore_duplicates: false)
      @file_url = file_url.to_s
      @errors = []
      @ignore_duplicates = ignore_duplicates
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

      csv_data.each do |row|
        row_data = headers.zip(row).to_h
        process_row(row_data)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      @errors << "Missing required columns: #{missing_fields.join(', ')}" if missing_fields.any?
    end

    def process_row(row)
      return if row['ID'].blank?

      missing_fields = REQUIRED_FIELDS.select { |field| row[field].blank? }
      if missing_fields.any?
        @errors << "Missing required fields (#{missing_fields.join(', ')}) for skill ID: #{row['ID']}"
        return
      end

      project = Project.find_by(id: row['Project'])
      unless project
        @errors << "Project '#{row['Project']}' not found for skill ID: #{row['ID']}"
        return
      end

      if Skill.exists?(id: row['ID']) && !@ignore_duplicates
        @errors << "Duplicate ID found for skill ID: #{row['ID']}"
        return
      end

      skill = Skill.find_or_initialize_by(id: row['ID'])
      skill.assign_attributes(
        name: row['Name'],
        description: row['Description'],
        project: project,
        category: normalize_category(row['Category'])
      )

      if row['Tag'].present?
        skill.tag_list = row['Tag'].split(',').map(&:strip)
      end

      skill.save!
    end

    def normalize_category(category)
      return 'other' if category.blank?

      %w[behavioral technical other].include?(category.downcase) ? category.downcase : 'other'
    end
  end
end
