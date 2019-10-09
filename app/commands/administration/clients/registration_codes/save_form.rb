# frozen_string_literal: true

module Administration
  module Clients
    module RegistrationCodes
      class SaveForm < Rectify::Form
        attribute :name, String
        attribute :code, String
        attribute :total_count, Integer
        attribute :disabled, Boolean, default: true
        attribute :end_level_id, Integer
        attribute :start_date, DateTime
        attribute :end_date, DateTime

        validates :name, :code, :total_count, :start_date, :end_date, presence: true
        validates :code, length: { in: 4..32 }
        validate :validate_code_criteria
        validate :validate_code_uniqueness
        validate :validate_usage_count
        validate :validate_date_range

        private

        def validate_code_criteria
          unless code.match?(/^[a-zA-Z0-9\-_]+$/)
            errors.add(:code, I18n.t('administration.clients.registration_codes.errors.criteria'))
          end
        end

        def validate_code_uniqueness
          if context.try(:registration_code).nil? &&
             RegistrationCode.where(code: code, end_level_id: end_level_id).exists?
            errors.add(:code, I18n.t('administration.clients.registration_codes.errors.duplicate_code'))
          end
        end

        def validate_usage_count
          if context.try(:registration_code) &&
             (total_count.to_i < context.registration_code.use_count.to_i)
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
end
