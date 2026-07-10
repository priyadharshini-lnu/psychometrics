# frozen_string_literal: true

module Memberships
  class ImportClientAssessorsForm < Rectify::Form
    VALID_HEADERS = %w[email].freeze

    mimic :client_assessors_import

    attribute :import_data, Object

    validate :validate_file_presence
    validate :validate_file_format
    validate :validate_rows_presence
    validate :validate_header
    validate :validate_body, if: :valid_headers?
    validate :validate_duplicated_emails

    def parsed_rows
      return @parsed_rows if defined?(@parsed_rows)

      @parsed_rows = CsvFileParser.call!(import_data, headers: :first_row).map do |row|
        row.to_h.symbolize_keys.transform_values { |value| Utility::String.remove_csv_injection_marker(value) }
      end
    rescue Errors::DownloadFailedError, CSV::MalformedCSVError, CSV::InvalidEncodingError => e
      errors.add(:import_data, e.message.presence || I18n.t('admin.errors_csv_file_required'))
      @parsed_rows = []
    end

    private

    def validate_file_presence
      return if import_data.present?

      errors.add(:import_data, I18n.t('shared.no_results_found'))
    end

    def validate_file_format
      return if import_data.blank?
      return if File.extname(import_data.original_filename.to_s).downcase == '.csv'

      errors.add(:import_data, I18n.t('admin.errors_csv_file_required'))
    end

    def validate_rows_presence
      return if errors[:import_data].present?
      return if parsed_rows.present?

      errors.add(:import_data, I18n.t('shared.no_results_found'))
    end

    def validate_header
      return if errors[:import_data].present?

      return if valid_headers?

      errors.add(:import_data, I18n.t('admin.invalid_csv_header'))
    end

    def validate_body
      parsed_rows.each_with_index do |attrs, index|
        email = attrs[:email].to_s.strip.downcase

        if email.blank?
          errors.add(:import_data, "Row #{index + 1}: #{I18n.t('errors.messages.blank')}")
          next
        end

        unless Devise.email_regexp.match?(email)
          errors.add(:import_data, "Row #{index + 1}: #{I18n.t('errors.messages.invalid')}")
          next
        end

        user = User.global_assessors.where(project_id: nil).where('LOWER(email) = ?', email).first
        if user.blank?
          errors.add(:import_data,
                     "Row #{index + 1} (#{email}): #{I18n.t('admin.client_assessor_import_global_assessor_required')}")
          next
        end

        next unless Membership.exists?(user_id: user&.id, client_id: context.client&.id, role: Membership::CLIENT_ASSESSOR_ROLE,
                                       campaign_id: nil)

        errors.add(:import_data,
                   "Row #{index + 1} (#{email}): #{I18n.t('admin.client_assessor_import_already_added',
                                                          email: email)}")
      end
    end

    def validate_duplicated_emails
      return if errors[:import_data].present?

      emails = parsed_rows.map { |row| row[:email].to_s.strip.downcase }.compact_blank
      duplicated_emails = emails.group_by(&:itself).select { |_email, entries| entries.size > 1 }.keys
      return if duplicated_emails.blank?

      errors.add(:import_data,
                 I18n.t('admin.client_assessor_import_duplicated_emails', emails: duplicated_emails.join(', ')))
    end

    def valid_headers?
      parsed_rows.first&.keys&.map(&:to_s)&.sort == VALID_HEADERS.sort
    end
  end
end
