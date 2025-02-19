# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ID Name Description Project].freeze

        attr_accessor :file, :ignore_duplicates

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

          errors.add(:file, 'must be a CSV file')
        end

        def validate_file_content
          return if file.blank?
          return unless file.respond_to?(:content_type) && file.content_type == 'text/csv'

          begin
            file.rewind if file.respond_to?(:rewind)
            csv_data = CSV.parse(file.read)
            headers = csv_data.first || []
            missing_fields = REQUIRED_FIELDS - headers
            if missing_fields.any?
              errors.add(:base, "Missing required columns: #{missing_fields.join(', ')}")
            end
          rescue CSV::MalformedCSVError => e
            errors.add(:base, "Invalid CSV format: #{e.message}")
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end
      end
    end
  end
end
