# frozen_string_literal: true

module Campaigns
  module RegistrationCodes
    class SaveForm < Rectify::Form
      attribute :name, String
      attribute :code, String
      attribute :total_count, Integer
      attribute :disabled, Boolean, default: true
      attribute :campaign_id, Integer
      attribute :start_date, DateTime
      attribute :end_date, DateTime
      attribute :restricted_domains, String

      validates :name, :code, :total_count, :start_date, :end_date, presence: true
      validates :code, length: { in: 4..32 },
        format: { with: /\A[a-zA-Z0-9\-_]+\z/,
                  message: I18n.t('administration.clients.registration_codes.errors.criteria') }
      validate :validate_code_uniqueness
      validate :validate_usage_count, unless: :new_registration_code_form?
      validate :validate_date_range
      validate :validate_restricted_domains

      def restricted_domains
        domains = super
        domains&.split("\n")&.map { |domain| domain.strip.downcase }
      end

      def validate_restricted_domains
        restricted_domains&.each do |domain|
          unless RegexConstants::DOMAIN_REGEX.match?(domain)
            errors.add(:restricted_domains, I18n.t('administration.clients.registration_codes.errors.incorrect_domain'))
            break
          end
        end
      end

      private

      def new_registration_code_form?
        context.try(:registration_code).nil?
      end

      def validate_code_uniqueness
        project_id = Campaign.find(campaign_id).project_id
        existing_record = RegistrationCode.find_by(code: code, project_id: project_id)
        if existing_record&.id != context.try(:registration_code)&.id
          errors.add(:code, I18n.t('administration.clients.registration_codes.errors.duplicate_code'))
        end
      end

      def validate_usage_count
        if total_count.to_i < context.registration_code.use_count.to_i
          errors.add(:total_count,
                     I18n.t('administration.clients.registration_codes.errors.count_invalid',
                            use_count: context.registration_code.use_count))
        end
      end

      def validate_date_range
        if end_date.to_i < start_date.to_i
          errors.add(:end_date, I18n.t('administration.clients.registration_codes.errors.invalid_end_date'))
        end
      end
    end
  end
end
