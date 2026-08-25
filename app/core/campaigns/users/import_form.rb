# frozen_string_literal: true

module Campaigns
  module Users
    class ImportForm < Rectify::Form
      mimic :user

      attribute :import_data, Array
      attribute :operation, String

      validates :operation, inclusion: { in: %w[skip_existing add_with_existing_response add_and_allow_new_response] }

      validate :validate_header
      validate :validate_uat_values
      validate :validate_body
      validate :validate_duplicated_emails
      validate :validate_manager_emails
      validate :validate_overwrite_permission
      validate :validate_available_licenses

      private

      def validate_overwrite_permission
        return if context.current_user.has_permission?(:users, :reset_password, campaign_id: context.campaign.id)

        if import_data[1..].any? { |data| data[:overwrite_password] == 'Yes' }
          errors.add(:import_data, :cant_overwrite_password)
        end
      end

      def validate_header
        errors.add(:import_data, :invalid_header) if (UserDecorator.export_headers - import_data.first).any?
      end

      def validate_uat_values
        import_data[1..].each.with_index do |attrs, index|
          next if ::Threesixty::Subjects::ParseUatValue.valid?(attrs[:is_uat])

          errors.add(:import_data, "Row #{index + 1}: UAT must be Yes, No, or blank")
        end
      end

      def validate_body
        import_data[1..].each.with_index do |attrs, index|
          form = ::Campaigns::Users::Import::CreateForm.new(attrs.merge(operation: operation)).
                 with_context(campaign: context.campaign)
          errors.add(:import_data, "Row #{index + 1}: #{form.errors.full_messages.join(', ')}") if form.invalid?
        end
      end

      def validate_duplicated_emails
        emails = []
        import_data[1..].pluck(:email).group_by { |a| a }.each do |email, group|
          emails << email if group.size > 1
        end
        errors.add(:import_data, :duplicated_emails, emails: emails.join(', ')) if emails.present?
      end

      def validate_manager_emails
        manager_emails = import_data[1..].pluck(:manager_email)
        existing_emails = campaign.users.where(email: manager_emails).pluck(:email)
        import_emails = import_data[1..].pluck(:email)

        manager_emails.each.with_index do |manager_email, index|
          next if manager_email.blank?

          if manager_email&.match?(Devise.email_regexp)
            unless existing_emails.include?(manager_email) || import_emails.include?(manager_email)
              errors.add(:import_data, :manager_not_found, row_number: (index + 1), email: manager_email)
            end
          else
            errors.add(:import_data, :invalid_email, row_number: (index + 1), email: manager_email)
          end
        end
      end

      def validate_available_licenses
        return if errors.any?
        return unless licenses_required?
        return if new_non_uat_user_emails.empty?
        return if available_license_count >= new_non_uat_user_emails.size

        errors.add(
          :import_data,
          :not_enough_licenses,
          required_count: new_non_uat_user_emails.size,
          available_count: available_license_count
        )
      end

      def licenses_required?
        operation != 'skip_existing' && campaign.campaign_reports.any?(&:auto_assign?)
      end

      def new_user_emails
        @new_user_emails ||= import_data[1..].pluck(:email).
                             compact.uniq - campaign.users.where(email: import_data[1..].
                              pluck(:email)).pluck(:email)
      end

      def uat_new_user_emails
        @uat_new_user_emails ||= import_data[1..].select do |row|
          ::Threesixty::Subjects::ParseUatValue.call(row[:is_uat])
        end.pluck(:email).compact.uniq
      end

      def new_non_uat_user_emails
        @new_non_uat_user_emails ||= new_user_emails - uat_new_user_emails
      end

      def available_license_count
        @available_license_count ||= License.available.
                                     for_project(campaign.project_id).
                                     where(client_id: campaign.client_id).
                                     sum('licenses.number + licenses.overuse_number - licenses.used_number')
      end

      def campaign
        context.campaign
      end
    end
  end
end
