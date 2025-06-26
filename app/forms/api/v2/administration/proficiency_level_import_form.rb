# frozen_string_literal: true

require 'csv-safe'

module Api
  module V2
    module Administration
      class ProficiencyLevelImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ProficiencyType SkillCategory TotalLevels LevelNumber LevelName LevelDescription].freeze
        OPTIONAL_FIELDS = %w[SkillName].freeze
        ALL_FIELDS = REQUIRED_FIELDS + OPTIONAL_FIELDS

        attr_accessor :file, :ignore_duplicates, :project_id

        validates :file, presence: true
        validate :validate_file_format
        validate :validate_file_content

        def processed_file
          return nil unless valid?

          file
        end

        private

        def validate_file_format
          return if file.blank?
          return if file.respond_to?(:content_type) && file.content_type == 'text/csv'

          errors.add(:file, I18n.t('administration.errors.csv_file_required'))
        end

        def validate_file_content
          return unless file.respond_to?(:read)

          begin
            file.rewind if file.respond_to?(:rewind)
            @csv_data = CsvFileParser.call!(file)
            validate_headers
            validate_rows
          rescue CSV::MalformedCSVError => e
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.translations.import.errors.invalid_csv_format',
                              message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def validate_headers
          headers = @csv_data.first || []
          missing_fields = REQUIRED_FIELDS - headers.compact
          if missing_fields.any?
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.missing_columns',
                              fields: missing_fields.join(', ')))
          end
        end

        def validate_rows
          return if errors.any?

          @csv_data.drop(1).each_with_index do |row, index|
            row_number = index + 2
            headers = @csv_data.first
            row_hash = headers.zip(row).to_h
            validate_row(row_hash, row_number)
          end
        end

        def validate_row(row, row_number)
          validate_required_fields(row, row_number)
        end

        def validate_required_fields(row, row_number)
          proficiency_type = row['ProficiencyType'].to_s.strip

          case proficiency_type
            when 'by_skill'
              validate_by_skill_row(row, row_number)
            when 'by_category'
              validate_by_category_row(row, row_number)
            when 'all_skills'
              validate_all_skills_row(row, row_number)
            else
              errors.add(:base,
                         I18n.t('administration.proficiency_levels.import.errors.invalid_proficiency_type',
                                row_number: row_number))
          end
        end

        def validate_by_skill_row(row, row_number)
          skill_name = row['SkillName'].presence

          if skill_name.blank?
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.by_skill_missing',
                              row_number: row_number))
            return
          end

          # Find skill by name
          skill = ::Skill.find_by(name: skill_name)
          if skill.nil?
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.skill_not_found',
                              row_number: row_number, name: skill_name))
            return
          end

          # Check for existing proficiency level with this skill
          if ::ProficiencyLevel.exists?(proficiency_type: 'by_skill',
                                        project_id: project_id,
                                        skill_id: skill.id)
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.by_skill_exists',
                              row_number: row_number))
          end
        end

        def validate_by_category_row(row, row_number)
          skill_category = row['SkillCategory'].to_s.strip.presence

          if skill_category.blank?
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.by_category_missing',
                              row_number: row_number))
          elsif ::ProficiencyLevel.exists?(proficiency_type: 'by_category',
                                           project_id: project_id,
                                           skill_category: skill_category)
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.by_category_exists',
                              row_number: row_number))
          end
        end

        def validate_all_skills_row(_row, row_number)
          if project_id.nil?
            # Check for existing global all_skills proficiency
            if ::ProficiencyLevel.exists?(proficiency_type: 'all_skills', project_id: nil)
              errors.add(:base,
                         I18n.t('administration.proficiency_levels.import.errors.all_skills_global_exists',
                                row_number: row_number))
            end
          elsif ::ProficiencyLevel.exists?(proficiency_type: 'all_skills', project_id: project_id)
            # Check for project-specific all_skills proficiency
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.import.errors.all_skills_project_exists',
                              row_number: row_number))
          end
        end
      end
    end
  end
end
