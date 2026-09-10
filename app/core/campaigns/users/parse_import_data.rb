# frozen_string_literal: true

module Campaigns
  module Users
    class ParseImportData < BaseCommand
      private_attr_reader :records

      HEADER_IMPORT_KEYS = %i[
        active
        is_uat
        first_name
        last_name
        email
        mobile_number
        password
        overwrite_password
        schedule_start_date
        schedule_end_date
        created_at
        manager_email
        current_job_role
        target_job_role
        level
      ].freeze

      def initialize(import_data, campaign)
        @campaign = campaign
        @records =
          if import_data.is_a?(ActionDispatch::Http::UploadedFile) || import_data.is_a?(Rack::Test::UploadedFile)
            CsvUtf8.to_array(import_data.path)
          else
            import_data
          end
      end

      def call
        header = records.shift
        rows = records.map do |record|
          record.map! { |value| Utility::String.remove_csv_injection_marker(value) }

          record.each_with_object({}).with_index do |(value, attrs), index|
            key = keys[index]
            next if keys.exclude?(key)

            attrs[key] = key == :active ? value.presence && value == 'Yes' : value
          end
        end
        broadcast :ok, [header] + rows
      end

      private

      def keys
        @keys ||= HEADER_IMPORT_KEYS + profile_fields + profile_custom_fields.map { |pf| pf.question.name.to_sym }
      end

      def profile_fields
        @profile_fields ||= %i[age gender profile_locale]
      end

      def profile_custom_fields
        @profile_custom_fields ||= @campaign.project.profile_setting.profile_fields.includes(:question)
      end
    end
  end
end
