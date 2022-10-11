# frozen_string_literal: true

module Users
  class ProfileForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String
    attribute :password_confirmation, String
    attribute :timezone, String
    attribute :age, Integer
    attribute :locale, String
    attribute :gender, String
    attribute :custom_fields, Hash

    validates :first_name, :last_name, presence: true
    validates :password, strong_password: true, if: :enable_strong_password?
    validate :password_length, unless: -> { password.blank? }
    validates :password_confirmation, presence: true, unless: -> { password.blank? }
    validates_confirmation_of :password, unless: -> { password.blank? }

    validate :validate_project_fields, if: :project?
    validate :validate_default_fields, if: :project?

    def password_length
      return unless password

      if context.user.password_length.exclude?(password.size)
        errors.add(:password, :too_short, count: context.user.password_length.min)
      end
    end

    def validate_project_fields
      project.profile_setting.profile_fields.includes(:question).each do |field|
        if (field.required || field.question.required_validation['enabled']) &&
           custom_fields[field.question_id.to_s.to_sym].blank?
          errors.add(field.question.name, 'required')
        end
      end
    end

    def validate_default_fields
      project.profile_setting.required_default_fields.each do |field, value|
        if value && !project.profile_setting.locked_default_fields[field] && send(field).blank?
          errors.add(field, 'required')
        end
      end
    end

    private

    def enable_strong_password?
      context.user.enforce_strong_password?
    end

    def project?
      project
    end

    def project
      context.project
    end
  end
end
