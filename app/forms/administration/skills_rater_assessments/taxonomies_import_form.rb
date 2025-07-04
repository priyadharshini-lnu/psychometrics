# frozen_string_literal: true

module Administration
  module SkillsRaterAssessments
    class TaxonomiesImportForm < Rectify::Form
      mimic :taxonomies_import_form

      FIRST_DATA_ROW = 2
      REQUIRED_SHEET_NAMES = ['Job Group Levels', 'Job Roles', 'Skill Group Levels', 'Skills',
                              'Job Roles And Skills Mapping'].freeze

      JOB_GROUP_LEVELS_HEADERS = ['Job Group', 'Label'].freeze
      SKILL_GROUP_LEVELS_HEADERS = ['Skill Group', 'Label'].freeze
      JOB_ROLES_MAPPING_HEADERS = ['Job Title Code', 'Skill Name', 'Expected Proficiency Level'].freeze

      attribute :file, Object
      attribute :project_id, Integer

      validates :file, presence: true,
      file_content_type: {
        allow: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/xlsx'
        ],
        message: :invalid_format
      }

      validate :validate_project_exists
      validate :ensure_all_required_sheets_exist, if: :roo_excel
      validate :validate_headers, if: :roo_excel
      validate :validate_file_content, if: :roo_excel

      def processed_file
        return nil unless valid?

        file
      end

      private

      def validate_project_exists
        return if project_id.nil?
        return if project.present?

        errors.add(:project, :must_exist)
      end

      def ensure_all_required_sheets_exist
        missing_sheets = REQUIRED_SHEET_NAMES - roo_excel.sheets

        if missing_sheets.any?
          errors.add(:file, :missing_sheets, sheets: missing_sheets.join(', '))
        end
      end

      def validate_headers
        validate_sheet_headers('Job Group Levels', JOB_GROUP_LEVELS_HEADERS)
        validate_sheet_headers('Skill Group Levels', SKILL_GROUP_LEVELS_HEADERS)
        validate_job_roles_headers
        validate_skills_headers
        validate_sheet_headers('Job Roles And Skills Mapping', JOB_ROLES_MAPPING_HEADERS)
      end

      def validate_sheet_headers(sheet_name, expected_headers)
        return unless roo_excel.sheets.include?(sheet_name)

        sheet = roo_excel.sheet(sheet_name)
        actual_headers = sheet.row(1).compact.map { |h| normalize_header(h) }

        missing_headers = expected_headers.reject do |expected|
          actual_headers.include?(normalize_header(expected))
        end

        if missing_headers.any?
          errors.add(:file, :missing_headers, sheet_name: sheet_name, headers: missing_headers.join(', '))
        end
      end

      def validate_job_roles_headers
        validate_dynamic_headers(
          sheet_name: 'Job Roles',
          group_levels_sheet_name: 'Job Group Levels',
          group_label: 'Job Group',
          extra_columns: ['Job Title Code', 'Job Description', 'Job Title Name']
        )
      end

      def validate_skills_headers
        validate_dynamic_headers(
          sheet_name: 'Skills',
          group_levels_sheet_name: 'Skill Group Levels',
          group_label: 'Skill Group',
          extra_columns: ['Skill Code', 'Skill Name', 'Skill Definition', 'Skill Type']
        )
      end

      def validate_dynamic_headers(sheet_name:, group_levels_sheet_name:, group_label:, extra_columns:)
        return unless roo_excel.sheets.include?(sheet_name) && roo_excel.sheets.include?(group_levels_sheet_name)

        group_levels_sheet = roo_excel.sheet(group_levels_sheet_name)
        level_count = group_levels_sheet.last_row - 1

        required_headers = []
        (1..level_count).each do |level|
          required_headers << "#{group_label} #{level} - Code"
          required_headers << "#{group_label} #{level} - Name"
        end

        required_headers += extra_columns

        validate_sheet_headers(sheet_name, required_headers)
      end

      def validate_file_content
        validate_sheet('Job Group Levels')
        validate_sheet('Skill Group Levels')
        validate_sheet('Job Roles', unique_columns: ['Job Title Code', 'Job Title Name'])
        validate_sheet('Skills', unique_columns: ['Skill Name'])
        validate_sheet('Job Roles And Skills Mapping')
      end

      def validate_sheet(sheet_name, unique_columns: [])
        return unless roo_excel.sheets.include?(sheet_name)

        sheet = roo_excel.sheet(sheet_name)
        headers = sheet.row(1)
        unique_trackers = unique_columns.index_with { Set.new }

        (FIRST_DATA_ROW..sheet.last_row).each do |row_index|
          row = sheet.row(row_index)

          headers.each_with_index do |header, column_index|
            value = row[column_index]

            if value.blank?
              errors.add(:file, :missing_value, row: row_index, field: header)
            end

            unique_column = unique_columns.find { |col| normalize_header(header) == normalize_header(col) }

            if unique_column
              if unique_trackers[unique_column].include?(value)
                errors.add(:file, :duplicate_value, row: row_index, value: value, field: header)
              else
                unique_trackers[unique_column].add(value)
              end
            end
          end
        end
      end

      def normalize_header(header)
        header.to_s.downcase.gsub(/(\d)\s*-\s*/, '\1 - ').squish
      end

      def project
        @project ||= ::Project.find_by(id: project_id)
      end

      def roo_excel
        @roo_excel ||= file.is_a?(Roo::Excelx) ? file : Roo::Excelx.new(file.path)
      rescue StandardError
        nil
      end
    end
  end
end
