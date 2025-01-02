# frozen_string_literal: true

module UserValidations
  extend ActiveSupport::Concern

  included do
    validates :first_name, :last_name, :email, length: { maximum: 100 }
    validates :first_name, :last_name, csv_injection_check: true
  end

  private

  def enable_strong_password?
    admin? || project&.security_setting&.enforce_strong_password
  end
end
