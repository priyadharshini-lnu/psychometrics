# frozen_string_literal: true

module WorkshopInvites
  class BulkImportSubjects < BaseCommand
    REQUIRED_HEADERS = %w[email].freeze

    private_attr_reader :csv_file, :campaign, :workshop_invite, :current_user, :validation_errors

    def initialize(campaign_id, csv_file, workshop_invite_id, current_user)
      @campaign = Campaign.find(campaign_id)
      @workshop_invite = WorkshopInvite.find(workshop_invite_id)
      @csv_file = csv_file
      @current_user = current_user
      @validation_errors = []
    end

    def call
      return broadcast(:ok, validation_errors: [{ message: I18n.t('admin.empty_csv_file') }]) if csv_empty?
      return broadcast(:ok, validation_errors: [{ message: I18n.t('admin.invalid_csv_header') }]) unless headers_valid?

      users = process_csv_rows
      return broadcast(:ok, validation_errors: validation_errors) if validation_errors.present?

      subjects_data = build_subjects_data(users)
      AdminJob.call(:bulk_create_workshop_invites,
                    { workshop_invite_id: workshop_invite.id, subjects: subjects_data },
                    current_user)

      broadcast(:ok, validation_errors: [])
    end

    private

    def csv_data
      @csv_data ||= ::CsvFileParser.call!(csv_file, headers: :first_row).map { |row| row.to_h.symbolize_keys }
    end

    def csv_empty?
      csv_data.empty? || csv_data.all? { |row| row.values.all? { |value| value.nil? || value.to_s.strip.empty? } }
    end

    def headers_valid?
      return false if csv_data.empty?

      first_row = csv_data.first
      REQUIRED_HEADERS.all? { |header| first_row.key?(header.to_sym) || first_row.key?(header) }
    end

    def process_csv_rows
      campaign_users = fetch_campaign_users
      valid_users = []
      users_with_indices = []

      csv_data.each.with_index do |row, index|
        email = row[:email]
        next if email_blank?(email)

        user = campaign_users[email]
        if user
          valid_users << user
          users_with_indices << [user, index + 1]
        else
          validation_errors << { message: I18n.t('admin.import_csv_error', index: index, email: email) }
        end
      end

      validation_errors.concat(validate_assessment_group_conflicts(users_with_indices))
      valid_users
    end

    def fetch_campaign_users
      emails = csv_data.pluck(:email).
               compact.
               reject(&:empty?)

      User.with_campaign_user(campaign.id).
        includes(:user_profile).
        where(email: emails).
        index_by(&:email)
    end

    def email_blank?(email)
      email.nil? || email.to_s.strip.empty?
    end

    def build_subjects_data(users)
      users.map { |user| { user_id: user.id } }
    end

    def validate_assessment_group_conflicts(users_with_indices)
      conflicts = []

      users_with_indices.each do |user, csv_index|
        existing_invite = find_existing_workshop_invite(user)
        next unless existing_invite

        conflicts << {
          message: I18n.t('admin.import_csv_assessment_group_error',
                          index: csv_index,
                          email: user.email,
                          workshopInviteName: existing_invite.workshop_invite.title)
        }
      end

      conflicts
    end

    def find_existing_workshop_invite(user)
      WorkshopInvitedSubject.in_campaign_assessment_group(
        campaign.id,
        workshop_invite.campaign_assessment_group_id
      ).where(user: user).first
    end
  end
end
