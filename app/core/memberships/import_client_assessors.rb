# frozen_string_literal: true

module Memberships
  class ImportClientAssessors < BaseCommand
    private_attr_reader :emails, :client_id, :creator

    def initialize(emails:, client_id:, creator:)
      @emails = emails
      @client_id = client_id
      @creator = creator
    end

    def call
      return broadcast(:error, [I18n.t('admin.client_assessor_import_client_required')]) if client.blank?

      normalized_emails = Array(emails).map { |email| email.to_s.strip.downcase }.compact_blank.uniq
      return broadcast(:error, [I18n.t('admin.client_assessor_import_emails_required')]) if normalized_emails.blank?

      errors = []
      imported_count = 0

      normalized_emails.each do |email|
        user = global_assessor_by_email(email)
        if user.blank?
          errors << "#{email}: #{I18n.t('admin.client_assessor_import_global_assessor_required')}"
          next
        end

        next if membership_exists_for?(user)

        membership = Membership.new(user: user)
        Memberships::CreateAdminCommand.call(
          membership,
          client,
          creator,
          Membership::CLIENT_ASSESSOR_ROLE
        )
        imported_count += 1
      rescue StandardError => e
        errors << "#{email}: #{error_message_for(e)}"
      end

      return broadcast(:error, errors) if errors.present?

      broadcast :ok, { imported_count: imported_count }
    end

    private

    def client
      @client ||= Client.find_by(id: client_id)
    end

    def membership_exists_for?(user)
      Membership.exists?(
        user_id: user.id,
        client_id: client.id,
        role: Membership::CLIENT_ASSESSOR_ROLE,
        campaign_id: nil
      )
    end

    def global_assessor_by_email(email)
      User.global_assessors.where(project_id: nil).where('LOWER(email) = ?', email).first
    end

    def error_message_for(error)
      return error.record.errors.full_messages.to_sentence if error.respond_to?(:record) && error.record&.errors

      error.message
    end
  end
end
