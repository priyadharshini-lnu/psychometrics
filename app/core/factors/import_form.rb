# frozen_string_literal: true

module Factors
  class ImportForm < Rectify::Form
    mimic :factor_import_form

    FIRST_DATA_ROW = 2
    REQUIRED_HEADER_FIELDS = ['Name', 'Code', 'Scoring Strategy'].freeze
    ALLOWED_SCORING_STRATEGIES = %w[questions questions_sum questions_percentage].freeze

    attribute :file, Object
    validates :file, presence: true,
              file_content_type: {
                allow: ['text/csv'],
                message: :invalid_format
              }

    delegate :dimension, to: :context

    validate :validate_headers, if: :file
    validate :validate_file_content, if: :should_validate_file_content?

    def processed_data
      return [] unless valid?

      data_rows.map do |row|
        sanitized_row = row.transform_values { |value| Utility::String.remove_csv_injection_marker(value.to_s) }

        {
          name: sanitized_row['Name'],
          code: sanitized_row['Code'],
          scoring_strategy: sanitized_row['Scoring Strategy']&.downcase,
          description: sanitized_row['Description'],
          precision: sanitized_row['Precision'].to_i,
          disabled: sanitized_row['Disabled'] == 'true',
          scale_min: sanitized_row['Scale Min'].to_f,
          scale_max: sanitized_row['Scale Max'].to_f,
          use_percentage: sanitized_row['Use Percentage'] == 'true'
        }
      end
    end

    private

    def should_validate_file_content?
      file.present? && errors.blank?
    end

    def parse_csv_file
      csv = if file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile)
              CSV.read(file.path, encoding: 'bom|utf-8', headers: true)
            else
              CSV.new(URI(file.url).open, headers: true).read
            end

      csv.map(&:to_h)
    end

    def validate_headers
      headers = data_rows.first&.keys || []
      missing_headers = REQUIRED_HEADER_FIELDS - headers

      if missing_headers.any?
        errors.add(:base, :missing_headers, headers: missing_headers.join(', '))
      end
    rescue CSV::InvalidEncodingError, CSV::MalformedCSVError => e
      errors.add(:base, :invalid_csv, error_message: e.message)
    end

    def validate_file_content
      data_rows.each_with_index do |row, index|
        validate_name(row, index)
        validate_scoring_strategy(row, index)
        validate_code(row, index)
      end
    rescue CSV::InvalidEncodingError, CSV::MalformedCSVError => e
      errors.add(:base, :invalid_csv, error_message: e.message)
    end

    def validate_name(row, index)
      if row['Name'].blank?
        errors.add(:base, :name_required, index: row_number(index))
      end
    end

    def validate_scoring_strategy(row, index)
      strategy = row['Scoring Strategy']&.downcase

      if strategy.blank?
        errors.add(:base, :scoring_strategy_required, index: row_number(index))
      elsif ALLOWED_SCORING_STRATEGIES.exclude?(strategy)
        errors.add(:base, :invalid_scoring_strategy,
                   index: row_number(index),
                   strategy: strategy,
                   allowed: ALLOWED_SCORING_STRATEGIES.join(', '))
      end
    end

    def validate_code(row, index)
      if row['Code'].blank?
        errors.add(:base, :code_required, index: row_number(index))
      elsif row['Code'].length < 3
        errors.add(:base, :code_length, index: row_number(index))
      end
    end

    def row_number(index)
      FIRST_DATA_ROW + index
    end

    def data_rows
      @data_rows ||= parse_csv_file
    end
  end
end
