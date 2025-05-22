# frozen_string_literal: true

module Administration
  class ImportSkills < BaseCommand
    REQUIRED_FIELDS = %w[ID Name Description].freeze
    REQUIRED_VALUES = %w[Name Description].freeze

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def process_csv_data(csv_data)
      headers = csv_data.shift

      csv_data.each.with_index(2) do |row, line_number|
        row_data = headers.zip(row).to_h
        process_row(row_data, line_number)
      end
    end

    def process_row(row, line_number)
      skill = initialize_skill(row)
      assign_skill_attributes(skill, row)

      skill.save!
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError, I18n.t(
        'administration.skills.errors.import.save_failed',
        line_number: line_number,
        name: row['Name'],
        message: e.message
      )
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
      category = category.to_s.strip.downcase
      %w[behavioral technical other].include?(category) ? category : 'other'
    end
  end
end
