# frozen_string_literal: true

module ReflectionQuestions
  class ImportForm
    include ActiveModel::Model

    REQUIRED_HEADERS = %w[ID Mandatory MinWords MaxWords] + ['English / en']

    attr_accessor :file

    validates :file, presence: true
    validate :validate_file_format
    validate :validate_file_content

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
        @csv_data = CSVSafe.parse(File.read(file, encoding: 'bom|utf-8'), encoding: 'utf-8')
        validate_headers
        validate_data
      rescue CSV::MalformedCSVError => e
        errors.add(:base,
                   I18n.t('administration.errors.invalid_csv_format', message: e.message))
      ensure
        file.rewind if file.respond_to?(:rewind)
      end
    end

    def validate_headers
      headers = @csv_data.first || []
      missing_fields = REQUIRED_HEADERS - headers
      if missing_fields.any?
        errors.add(:base,
                   I18n.t('administration.errors.missing_columns', fields: missing_fields.join(', ')))
      end
    end

    def validate_data
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
      if row['English / en'].blank?
        errors.add(:base, I18n.t('administration.reflection_questions.import.errors.missing_eng_question',
                                 row: row_number))
      end
      if row['Mandatory'].blank? || %w[yes no].exclude?(row['Mandatory'].to_s.downcase)
        errors.add(:base, I18n.t('administration.reflection_questions.import.errors.invalid_required_column_format',
                                 row: row_number))
      end
      if row['MinWords'].present? && !row['MinWords'].to_s.match?(/^\d+$/)
        errors.add(:base, I18n.t('administration.reflection_questions.import.errors.invalid_min_words_column_format',
                                 row: row_number))
      end
      if row['MaxWords'].present? && !row['MaxWords'].to_s.match?(/^\d+$/)
        errors.add(:base, I18n.t('administration.reflection_questions.import.errors.invalid_max_words_column_format',
                                 row: row_number))
      end
    end
  end
end
