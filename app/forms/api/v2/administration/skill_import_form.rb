# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[Name Description].freeze

        attr_accessor :file, :project_id

        validates :file, presence: true
        validate :validate_file_format
        validate :validate_file_content

        def row_count
          @csv_data.drop(1)&.size || 0
        end

        private

        def validate_file_format
          return if file.blank?
          return if file.respond_to?(:content_type) && file.content_type == 'text/csv'

          errors.add(:file, I18n.t('administration.errors.csv_file_required'))
        end

        def validate_file_content
          return if file.blank?
          return unless file.respond_to?(:content_type) && file.content_type == 'text/csv'

          begin
            file.rewind if file.respond_to?(:rewind)
            @csv_data = CsvFileParser.call!(file)
            validates_headers
            validates_data
          rescue CSV::MalformedCSVError => e
            errors.add(:base, "Invalid CSV format: #{e.message}")
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def validates_data
          return if errors.any?

          @csv_data.drop(1).each_with_index do |row, index|
            row_number = index + 2
            headers = @csv_data.first
            row_hash = headers.zip(row).to_h
            validate_row(row_hash, row_number)
          end
        end

        def validate_row(row, row_number)
          missing_fields = REQUIRED_FIELDS.select { |field| row[field].blank? }
          if missing_fields.any?
            errors.add(
              :base,
              I18n.t(
                'administration.skills.errors.import.missing_fields_data',
                fields: missing_fields.join(', '),
                line_number: row_number
              )
            )
          end

          validate_skill_belongs_to_project(row, row_number)
        end

        def validate_skill_belongs_to_project(row, row_number)
          return if row['ID'].blank? || project_id.blank?

          skill = ::Skill.find_by(id: row['ID'])
          if skill.present? && skill.project_id != project_id
            errors.add(
              :base,
              I18n.t(
                'administration.skills.errors.import.skill_not_in_project',
                skill_id: row['ID'],
                line_number: row_number
              )
            )
          end
        end

        def validates_headers
          headers = @csv_data.first || []
          missing_fields = REQUIRED_FIELDS - headers
          if missing_fields.any?
            errors.add(
              :base,
              I18n.t('administration.skills.import.errors.missing_columns', fields: missing_fields.join(', '))
            )
          end
        end
      end
    end
  end
end
