# frozen_string_literal: true

module CampaignReports
  class ValidateBulkAssetsCsvForm < Rectify::Form
    mimic :validate_bulk_assets_csv_form

    attribute :parsed_csv_data
    attribute :user_reports_by_email, Hash

    MAX_EMAILS = 200
    EXPECTED_HEADERS = %w[user_email file_name].freeze

    validate :validate_csv

    def validate_csv
      return add_error(:csv_cannot_be_empty) if parsed_csv_data.empty?

      validate_headers
      return if errors.any?

      validate_no_blank_values
      return if errors.any?

      validate_max_emails
      return if errors.any?

      validate_file_names
      validate_file_name_uniqueness
      validate_user_email_uniqueness
      validate_user_reports_exist
    end

    private

    def validate_headers
      headers = parsed_csv_data.headers&.map { |h| h.to_s.strip } || []
      add_error(:csv_must_contain_two_headers, headers: EXPECTED_HEADERS.join(', ')) unless headers == EXPECTED_HEADERS
    end

    def validate_no_blank_values
      add_error(:csv_contains_blank_values) if user_emails.any?(&:blank?) || file_names.any?(&:blank?)
    end

    def validate_file_names
      add_error(:all_file_names_must_have_pdf_extension) unless file_names.all? { |f| f.end_with?('.pdf') }
    end

    def validate_file_name_uniqueness
      add_error(:csv_file_name_must_be_unique) if file_names.uniq.size != file_names.size
    end

    def validate_user_email_uniqueness
      add_error(:csv_user_emails_must_be_unique) if user_emails.uniq.size != user_emails.size
    end

    def validate_max_emails
      count = user_emails.uniq.size
      add_error(:max_emails_in_csv, max: MAX_EMAILS, count: count) if count > MAX_EMAILS
    end

    def validate_user_reports_exist
      missing_emails = user_emails.uniq - user_reports_by_email.keys
      add_error(:missing_user_reports, emails: missing_emails.join(', ')) if missing_emails.any?
    end

    def user_emails
      @user_emails ||= parsed_csv_data.map { |row| row['user_email'].to_s.strip }
    end

    def file_names
      @file_names ||= parsed_csv_data.map { |row| row['file_name'].to_s.strip }
    end

    def add_error(key, **)
      errors.add(:base, I18n.t("administration.campaign_report.bulk_assets_upload.errors.#{key}", **))
    end
  end
end
