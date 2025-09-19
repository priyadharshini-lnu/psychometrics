# frozen_string_literal: true

# Form for importing campaign factors in both Assessments and Reports builder.
module Administration
  module CampaignFactors
    class ImportForm < Rectify::Form
      mimic :campaign_factors_import_form

      FIRST_DATA_ROW = 2
      REQUIRED_HEADER_FIELDS = ['Name', 'Code', 'Output Type', 'Description'].freeze
      MAX_CAMPAIGN_FACTORS = 300

      attribute :file, Object
      attribute :resource_class, String
      attribute :resource_id, Integer

      validates :resource_class, :resource_id, presence: true
      validates :file, presence: true,
        file_content_type: {
          allow: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/xlsx'
          ],
          message: :invalid_format
        }

      validate :validate_resource_exists
      validate :validate_headers
      validate :validate_campaign_factors_count, if: :resource
      validate :validate_file_content

      def processed_data
        data_rows.map do |row|
          sanitized_row = row.transform_values { |value| Utility::String.remove_csv_injection_marker(value) }
          {
            name: sanitized_row['Name'],
            code: sanitized_row['Code'],
            output_type: sanitized_row['Output Type'],
            description: sanitized_row['Description']
          }
        end
      end

      private

      def validate_resource_exists
        return if resource.present?

        errors.add(:resource, :must_exist, resource: resource_class.humanize)
      end

      def validate_campaign_factors_count
        return if data_rows.blank?

        new_code_count = data_rows.count { |row| !existing_campaign_factors_by_code[row['Code']] }
        total_factors = existing_campaign_factors_by_code.size + new_code_count

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
        current_output_type = get_output_type(existing_factor)

        if current_output_type.present? && current_output_type != output_type
          errors.add(:base, :type_mismatch, code: code, index: row_number(index))
        elsif data_rows[0...index].any? { |r| r['Code'] == code }
          errors.add(:base, :duplicate_code, code: code, index: row_number(index))
        end
      end

      def get_output_type(factor)
        return unless factor

        factor.respond_to?(:output_type) ? factor.output_type : factor['outputType']
      end

      def row_number(index)
        FIRST_DATA_ROW + index
      end

      def resource
        @resource ||= resource_class.safe_constantize&.find_by(id: resource_id)
      end

      def existing_campaign_factors_by_code
        @existing_campaign_factors_by_code ||= case resource_class
                                                 when 'Report'
                                                   resource.campaign_factors.index_by(&:code)
                                                 when 'Assessment'
                                                   (resource.campaign_factors_list || []).index_by { |f| f['code'] }
                                                 else
                                                   {}
                                               end
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
