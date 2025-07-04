# frozen_string_literal: true

require 'csv-safe'

module Administration
  class ImportProficiencyLevels < BaseCommand
    REQUIRED_FIELDS = %w[ProficiencyType TotalLevels LevelNumber LevelName LevelDescription].freeze

    def initialize(file, project_id: nil, ignore_duplicates: false)
      @file = file
      @errors = []
      @ignore_duplicates = ignore_duplicates
      @project_id = project_id
      @proficiency_groups = {}
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
      validate_headers(headers)
      return if @errors.any?

      csv_data.each.with_index(2) do |row, line_number|
        row_data = headers.zip(row).to_h
        process_row(row_data, line_number)
      end
    end

    def validate_headers(headers)
      missing_fields = REQUIRED_FIELDS - headers
      if missing_fields.any?
        @errors << I18n.t('administration.proficiency_levels.import.errors.missing_columns',
                          fields: missing_fields.join(', '))
      end
    end

    def process_row(row, line_number)
      return unless validate_required_fields(row, line_number)

      key = build_proficiency_key(row)
      @proficiency_groups[key] ||= {
        proficiency_type: row['ProficiencyType'],
        skill_category: row['SkillCategory'],
        skill_name: row['SkillName'],
        total_levels: row['TotalLevels'].to_i,
        levels: []
      }

      @proficiency_groups[key][:levels] << {
        number: row['LevelNumber'].to_i,
        name: row['LevelName'],
        description: row['LevelDescription']
      }

      if @proficiency_groups[key][:levels].size == @proficiency_groups[key][:total_levels]
        save_proficiency_group(key, line_number)
      end
    end

    def validate_required_fields(row, line_number)
      missing_fields = REQUIRED_FIELDS.select { |field| row[field].blank? }
      if missing_fields.any?
        @errors << I18n.t('administration.proficiency_levels.import.errors.missing_required_fields',
                          line: line_number, fields: missing_fields.join(', '))
        return false
      end
      true
    end

    def build_proficiency_key(row)
      [
        @project_id,
        row['ProficiencyType'],
        row['SkillCategory'],
        row['SkillName']
      ].join('|')
    end

    def save_proficiency_group(key, line_number)
      group = @proficiency_groups[key]

      levels = group[:levels].sort_by { |l| l[:number].to_i }

      attrs = {
        project_id: @project_id,
        proficiency_type: group[:proficiency_type],
        skill_category: group[:skill_category]
      }

      if group[:proficiency_type] == 'by_skill' && group[:skill_name].present?
        skill = Skill.find_by(name: group[:skill_name])
        if skill.nil?
          @errors << I18n.t('administration.proficiency_levels.import.errors.skill_not_found',
                            line: line_number, name: group[:skill_name])
          return
        end
        attrs[:skill_id] = skill.id
      end

      attrs[:level] = group[:total_levels].to_i

      proficiency_level = ProficiencyLevel.find_or_initialize_by(attrs)
      proficiency_level.level_definition = levels.map do |level|
        {
          'level' => level[:number].to_i,
          'name' => level[:name],
          'description' => level[:description]
        }
      end

      save_proficiency_level(proficiency_level, line_number)
    end

    def parse_json(value, line_number)
      return nil if value.blank?

      parsed = JSON.parse(value)

      unless parsed.is_a?(Hash) || parsed.is_a?(Array)
        raise JSON::ParserError, I18n.t('administration.proficiency_levels.import.errors.invalid_json_structure')
      end

      parsed
    rescue JSON::ParserError => e
      @errors << I18n.t('administration.proficiency_levels.import.errors.invalid_json',
                        line: line_number, message: e.message)
      nil
    end

    def save_proficiency_level(proficiency_level, line_number)
      proficiency_level.save!
    rescue ActiveRecord::RecordInvalid => e
      @errors << I18n.t('administration.proficiency_levels.import.errors.save_failed',
                        line: line_number, message: e.message)
    end
  end
end
