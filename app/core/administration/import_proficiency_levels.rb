# frozen_string_literal: true

require 'csv-safe'

module Administration
  class ImportProficiencyLevels < BaseCommand
    REQUIRED_FIELDS = %w[ProficiencyType TotalLevels].freeze

    def initialize(file, project_id: nil, ignore_duplicates: false)
      @file = file
      @errors = []
      @ignore_duplicates = ignore_duplicates
      @project_id = project_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file)
        return @errors if @errors.any?

        ActiveRecord::Base.transaction do
          process_csv_data(csv_data)
          raise ActiveRecord::Rollback if @errors.any?
        end
      rescue Errors::DownloadFailedError => e
        @errors << e.message
      rescue CSV::MalformedCSVError => e
        @errors << I18n.t('administration.proficiency_levels.import.errors.invalid_csv_format', message: e.message)
      end

      @errors.empty? ? true : @errors
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
      proficiency_level = find_or_build_proficiency_level(row)
      level_definitions = extract_level_definitions(row)

      proficiency_level.assign_attributes(
        proficiency_type: row['ProficiencyType'],
        skill_category: row['SkillCategory'].presence,
        level: row['TotalLevels'],
        level_definition: level_definitions
      )

      if row['SkillName'].present?
        skill = Skill.find_by!(name: row['SkillName'])
        proficiency_level.skill = skill
      end

      proficiency_level.save!
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.proficiency_levels.import.errors.invalid_record',
                        line: line_number, message: e.message)
    end

    def find_or_build_proficiency_level(row)
      if row['ID'].present?
        ProficiencyLevel.find_or_initialize_by(id: row['ID'])
      else
        ProficiencyLevel.new(project_id: @project_id)
      end
    end

    def extract_level_definitions(row)
      max_levels = row['TotalLevels'].to_i
      level_definitions = []

      1.upto(max_levels) do |level_num|
        level_value = row["Level#{level_num}"]
        next if level_value.blank?

        level_definitions << {
          'level' => level_value.to_i,
          'name' => row["Name#{level_num}"],
          'description' => row["Description#{level_num}"]
        }
      end

      level_definitions
    end
  end
end
