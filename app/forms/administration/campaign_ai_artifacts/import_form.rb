# frozen_string_literal: true

module Administration
  module CampaignAIArtifacts
    class ImportForm < Rectify::Form
      mimic :campaign_ai_artifacts_import_form

      FIRST_DATA_ROW = 2
      REQUIRED_HEADER_FIELDS = %w[Name Code AIAssistantID].freeze
      MAX_CAMPAIGN_AI_ARTIFACTS = ::AI::CampaignArtifact::MAX_CAMPAIGN_AI_ARTIFACTS

      attribute :file, Object
      attribute :resource_class, String
      attribute :resource_id, Integer

      validates :resource_class, :resource_id, presence: true
      validates :file, presence: true,
                file_content_type: {
                  allow: %w[text/csv application/csv],
                  message: :invalid_format
                }

      validate :validate_resource_exists
      validate :validate_headers
      validate :validate_campaign_ai_artifacts_count, if: :resource
      validate :validate_file_content

      def processed_data
        data_rows.map do |row|
          sanitized_row = row.transform_values { |value| Utility::String.remove_csv_injection_marker(value) }
          ai_assistant = find_ai_assistant(sanitized_row['AIAssistantID'])

          {
            name: sanitized_row['Name'],
            code: sanitized_row['Code'],
            ai_assistant: ai_assistant
          }
        end
      end

      private

      def validate_resource_exists
        return if resource.present?

        errors.add(:resource, :must_exist, resource: resource_class.humanize)
      end

      def validate_campaign_ai_artifacts_count
        return if data_rows.blank?

        new_code_count = data_rows.count { |row| !existing_artifacts_by_code[row['Code']] }
        total_artifacts = existing_artifacts_by_code.size + new_code_count

        if total_artifacts > MAX_CAMPAIGN_AI_ARTIFACTS
          errors.add(:base, :max_limit_reached, count: MAX_CAMPAIGN_AI_ARTIFACTS)
        end
      end

      def validate_headers
        return if parsed_file.blank?

        headers = parsed_file.first&.keys&.map(&:to_s) || []
        missing_headers = REQUIRED_HEADER_FIELDS - headers

        if missing_headers.any?
          errors.add(:base, :missing_headers, headers: missing_headers.join(', '))
        end
      end

      def validate_file_content
        data_rows.each_with_index do |row, index|
          validate_name(row, index)
          validate_code(row, index)
          validate_ai_assistant(row, index)
        end
      end

      def validate_name(row, index)
        name = row['Name']

        if name.blank?
          errors.add(:base, :blank, entity: 'Name', index: row_number(index))
        end
      end

      def validate_code(row, index)
        code = row['Code']

        if code.blank?
          errors.add(:base, :blank, entity: 'Code', index: row_number(index))
          return
        end

        unless code.match?(::RegexConstants::LUA_VARIABLE)
          errors.add(:base, :invalid_code_format, code: code, index: row_number(index))
        end

        if data_rows[0...index].any? { |r| r['Code'] == code }
          errors.add(:base, :duplicate_code, code: code, index: row_number(index))
        end
      end

      def validate_ai_assistant(row, index)
        assistant_id = row['AIAssistantID']

        if assistant_id.blank?
          errors.add(:base, :blank, entity: 'Assistant ID', index: row_number(index))
          return
        end

        assistant = find_ai_assistant(assistant_id)
        unless assistant
          errors.add(:base, :ai_assistant_not_found, id: assistant_id, index: row_number(index))
        end
      end

      def find_ai_assistant(assistant_id)
        return nil if assistant_id.blank?

        return nil unless assistant_id.to_s.match?(/^\d+$/)

        ai_assistant = ai_assistants_by_id[assistant_id.to_i]
        return nil unless ai_assistant

        ai_assistant.as_json(include: :assistant_output_schema_keys)
      end

      def ai_assistants_by_id
        @ai_assistants_by_id ||= begin
          assistant_ids = data_rows.filter_map { |row| row['AIAssistantID'] }.
                          select { |id| id.to_s.match?(/^\d+$/) }.
                          map(&:to_i).
                          uniq

          if assistant_ids.empty?
            {}
          else
            ::AI::Assistant.includes(:assistant_output_schema_keys).
              where(id: assistant_ids).
              index_by(&:id)
          end
        end
      end

      def serialized_ai_assistants
        @serialized_ai_assistants ||= ai_assistants_by_id.transform_values do |assistant|
          assistant.as_json(include: :assistant_output_schema_keys)
        end
      end

      def row_number(index)
        FIRST_DATA_ROW + index
      end

      def resource
        @resource ||= resource_class.safe_constantize&.find_by(id: resource_id)
      end

      def existing_artifacts_by_code
        @existing_artifacts_by_code ||= case resource_class
                                          when 'Report'
                                            resource.campaign_ai_artifacts.index_by(&:code)
                                          else
                                            {}
                                        end
      end

      def data_rows
        @data_rows ||= parsed_file || []
      end

      def parsed_file
        @parsed_file ||= begin
          throw :abort if errors.any?

          csv_result = ::CsvFileParser.call!(file, headers: true)
          csv_result.map(&:to_h)
        end
      end
    end
  end
end
