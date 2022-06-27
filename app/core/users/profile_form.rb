# frozen_string_literal: true

module Users
  class ProfileForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String

    validates :first_name, :last_name, presence: true
    validates :password, strong_password: true, if: :enable_strong_password?
    validate :password_length

    def password_length
      return unless password

      if context.user.password_length.exclude?(password.size)
        errors.add(:password, :too_short, { count: context.user.password_length.min })
      end
    end

    private

    def enable_strong_password?
      context.user.project.strong_password_enabled || context.user.enforce_strong_password?
    end
  end
end
