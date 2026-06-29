# frozen_string_literal: true

module Users
  class Application < User
    NAME_FORMAT = /\A[a-zA-Z0-9]+( [a-zA-Z0-9]+)*\z/

    has_many :api_keys, class_name: 'ApiKey', foreign_key: :user_id, inverse_of: :application, dependent: :destroy
    has_many :public_keys, class_name: 'ApplicationPublicKey', foreign_key: :user_id, dependent: :destroy
    has_one :application_setting, class_name: 'ApplicationSetting', foreign_key: :user_id, dependent: :destroy
    has_many :ip_whitelist_entries, class_name: 'ApplicationIpWhitelistEntry', through: :application_setting

    scope :active, -> { where(disabled: false) }
    scope :inactive, -> { where(disabled: true) }

    validate :validate_application_name
    validate :unique_dasherized_name_within_client

    before_validation :generate_email_and_defaults, on: :create
    after_create :create_application_setting

    def self.ransackable_attributes(_auth_object = nil)
      %w[disabled]
    end

    def password_required?
      false
    end

    def active_for_authentication?
      false
    end

    def valid_password?(_password)
      false
    end

    def send_reset_password_instructions
      false
    end

    def invite!(*_args)
      raise NotImplementedError, 'Application users cannot be invited'
    end

    def send_magic_link
      false
    end

    def two_factor_enabled?
      false
    end

    def dasherized_name
      first_name.to_s.parameterize
    end

    private

    def generate_email_and_defaults
      self.last_name = 'App'
      self.email = "#{first_name.to_s.parameterize}.#{tenant_id}@app.com"
    end

    def validate_application_name
      if first_name.blank?
        errors.add(:name, :blank)
      elsif !NAME_FORMAT.match?(first_name)
        errors.add(:name, I18n.t('admin.application_name_format_hint'))
      end
    end

    def unique_dasherized_name_within_client
      return unless first_name.present? && tenant_id.present?

      existing = Users::Application.
                 where(tenant_id: tenant_id).
                 where.not(id: id).
                 exists?(["LOWER(REPLACE(first_name, ' ', '-')) = ?", dasherized_name])

      errors.add(:name, I18n.t('admin.application_name_already_taken')) if existing
    end
  end
end
