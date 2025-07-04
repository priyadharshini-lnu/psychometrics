# frozen_string_literal: true

module Administration
  class ImportDevelopmentActions < BaseCommand
    REQUIRED_FIELDS = %w[SkillID Name Description Type DevelopmentActionType].freeze
    OPTIONAL_FIELDS = %w[ID CourseURL CourseStartDate CourseEndDate CourseImage AvailableLanguages Duration].freeze

    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file, headers: true)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def process_csv_data(csv_data)
      csv_data.each do |row|
        process_development_action(row.to_h)
      end
    end

    def process_development_action(row_data)
      development_action = find_or_create_development_action(row_data)
      if development_action.nil?
        raise Errors::ImportError,
              I18n.t('administration.development_action_import.errors.skill_not_found',
                     skill_id: row_data['SkillID'])
      end

      development_action.name = row_data['Name']
      development_action.description = row_data['Description']
      development_action.course_url = row_data['CourseURL']
      development_action.course_start_date = parse_date(row_data['CourseStartDate'])
      development_action.course_end_date = parse_date(row_data['CourseEndDate'])
      development_action.duration = row_data['Duration']&.to_i

      if development_action.course?
        development_action.available_languages = row_data[
          'AvailableLanguages'
        ].to_s.split(',').map(&:strip).compact_blank
      end

      if row_data['CourseImage'].present?
        attach_image(development_action, row_data['CourseImage'])
      end

      development_action.save!
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError,
            I18n.t('administration.development_action_import.errors.save_failed', message: e.message)
    end

    def find_or_create_development_action(row_data)
      id = row_data['ID']

      skill = Skill.where(id: row_data['SkillID']).where('project_id = ? OR project_id IS NULL', @project_id).first
      return nil if skill.nil?

      development_action = DevelopmentAction.find_or_initialize_by(id: id)
      skill_ids = development_action.skill_ids
      development_action.assign_attributes(
        project_id: @project_id,
        learning_style: row_data['Type'].downcase,
        development_action_type: row_data['DevelopmentActionType'].downcase
      )

      development_action.skills << skill unless skill_ids.include?(skill.id)

      development_action
    end

    def attach_image(development_action, image_url)
      uri = URI.parse(image_url)
      unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
        raise Errors::ImportError,
              I18n.t('administration.development_action_import.errors.invalid_image_url', url: image_url)
      end

      downloaded_image = uri.open
      development_action.image.attach(
        io: downloaded_image,
        filename: File.basename(uri.path),
        content_type: downloaded_image.content_type
      )
    rescue OpenURI::HTTPError, URI::InvalidURIError => e
      raise Errors::ImportError,
            I18n.t('administration.development_action_import.errors.image_download_failed', url: image_url,
message: e.message)
    rescue ActiveStorage::IntegrityError => e
      raise Errors::ImportError,
            I18n.t('administration.development_action_import.errors.invalid_image_file', message: e.message)
    end

    def parse_date(date_string)
      return nil if date_string.blank?

      Date.parse(date_string)
    rescue Date::Error
      raise Errors::ImportError,
            I18n.t('administration.development_action_import.errors.invalid_date', date: date_string)
    end
  end
end
