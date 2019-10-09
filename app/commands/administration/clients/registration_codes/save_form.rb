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
        validates :code, length: { in: 4..32 },
          format: { with: /\A[a-zA-Z0-9\-_]+\z/,
                    message: I18n.t('administration.clients.registration_codes.errors.criteria') }
        validate :validate_code_uniqueness, if: :new_registration_code_form?
        validate :validate_usage_count, unless: :new_registration_code_form?
        validate :validate_date_range

        private

        def new_registration_code_form?
          context.try(:registration_code).nil?
        end

        def validate_code_uniqueness
          if RegistrationCode.where(code: code, end_level_id: end_level_id).exists?
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
end
