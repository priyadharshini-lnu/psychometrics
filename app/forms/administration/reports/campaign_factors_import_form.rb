# frozen_string_literal: true

module Administration
  module Reports
    class CampaignFactorsImportForm < Rectify::Form
      mimic :campaign_factors_import_form

      FIRST_DATA_ROW = 2
      REQUIRED_HEADER_FIELDS = ['Name', 'Code', 'Output Type'].freeze
      MAX_CAMPAIGN_FACTORS = 300

      attribute :file, Object
      attribute :report_id, Integer

      validates :report_id, presence: true
      validates :file, presence: true,
      file_content_type: {
        allow: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/xlsx'
        ],
        message: :invalid_format
      }
      validate :validate_report_exists
      validate :validate_headers
      validate :validate_campaign_factors_count, if: :report
      validate :validate_file_content

      def processed_data
        data_rows.map do |row|
          sanitized_row = row.transform_values { |value| Utility::String.remove_csv_injection_marker(value) }
          {
            name: sanitized_row['Name'],
            code: sanitized_row['Code'],
            output_type: sanitized_row['Output Type']
          }
        end
      end

      private

      def validate_report_exists
        return if report.present?

        errors.add(:report, :must_exist)
      end

      def validate_campaign_factors_count
        return if data_rows.blank?

        new_code_count = data_rows.count do |row|
          !existing_campaign_factors_by_code[row['Code']]
        end

        total_factors = report.campaign_factors.count + new_code_count

        if total_factors > MAX_CAMPAIGN_FACTORS
          errors.add(:base, :max_limit_reached, count: MAX_CAMPAIGN_FACTORS)
        end
      end

      def validate_headers
        headers = parsed_file.first.keys || []
        missing_headers = REQUIRED_HEADER_FIELDS - headers

        if missing_headers.any?
          errors.add(:base, :missing_headers, headers: missing_headers.join(', '))
        end
      end

      def validate_file_content
        data_rows.each_with_index do |row, index|
          validate_name(row, index)
          validate_output_type(row, index)
          validate_code_uniqueness(row, index)
        end
      end

      def validate_name(row, index)
        name = row['Name']

        if name.blank?
          errors.add(:base, :blank, entity: 'Name', index: row_number(index))
        end
      end

      def validate_output_type(row, index)
        output_type = row['Output Type']

        if output_type.blank?
          errors.add(:base, :blank, entity: 'Output Type', index: row_number(index))
          return
        end

        unless %w[numeric string].include?(output_type)
          errors.add(:base, :invalid_output_type, output_type: output_type, index: row_number(index))
        end
      end

      def validate_code_uniqueness(row, index)
        code = row['Code']
        output_type = row['Output Type']

        if code.blank?
          errors.add(:base, :blank, entity: 'Code', index: row_number(index))
          return
        end

        existing_factor = existing_campaign_factors_by_code[code]

        if existing_factor
          if existing_factor.output_type != output_type
            errors.add(:base, :type_mismatch, code: code, index: row_number(index))
          end
        elsif data_rows[0...index].any? { |r| r['Code'] == code }
          errors.add(:base, :duplicate_code, code: code, index: row_number(index))
        end
      end

      def row_number(index)
        FIRST_DATA_ROW + index
      end

      def existing_campaign_factors_by_code
        @existing_campaign_factors_by_code ||= report.campaign_factors.index_by(&:code)
      end

      def report
        @report ||= ::Report.find_by(id: report_id)
      end

      def data_rows
        @data_rows ||= parsed_file[FIRST_DATA_ROW - 1..] || []
      end

      def parsed_file
        @parsed_file ||= open_spreadsheet.parse(headers: true, clean: false)
      end

      def open_spreadsheet
        throw :abort if errors.any?

        Roo::Excelx.new(file.path)
      end
    end
  end
end
