# frozen_string_literal: true

module ReflectionQuestions
  class Import < BaseCommand
    REQUIRED_FIELDS = %w[ID Mandatory MinWords MaxWords].freeze

    attr_accessor :file, :project_id

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
      @errors = []
    end

    def call
      csv_data = download_file
      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def download_file
      uri = URI.parse(file.url)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        raise Errors::ImportError,
              I18n.t('administration.errors.invalid_url_format')
      end

      content = uri.open.read
      # Remove UTF-8 BOM if present (EF BB BF)
      content = content.force_encoding('UTF-8').sub("\xEF\xBB\xBF", '')
      CSV.parse(content, headers: true)
    rescue URI::InvalidURIError => e
      raise Errors::ImportError,
            I18n.t('administration.errors.invalid_url', message: e.message)
    rescue OpenURI::HTTPError => e
      raise Errors::ImportError,
            I18n.t('administration.errors.download_failed', message: e.message)
    end

    def process_csv_data(csv_data)
      csv_data.each do |row|
        process_row(row.to_h)
      end
    end

    def process_row(row_data)
      reflection_question = find_or_create_reflection_question(row_data)
      reflection_question.save!
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError,
            I18n.t('administration.reflection_questions.import.errors.save_failed', message: e.message)
    end

    def find_or_create_reflection_question(row_data)
      id = row_data['ID']

      reflection_question = ReflectionQuestion.find_or_initialize_by(id: id, project_id: project_id)
      reflection_question.assign_attributes(project_id: project_id)
      reflection_question.mandatory = row_data['Mandatory'] == 'yes'
      reflection_question.min_words = row_data['MinWords']
      reflection_question.max_words = row_data['MaxWords']

      row_data.slice(*(row_data.keys - REQUIRED_FIELDS)).each do |key, vlaue|
        next if vlaue.blank?

        lang = key.split(' / ').last
        reflection_question.send(:"question_#{lang}=", vlaue)
      end

      reflection_question
    end
  end
end
