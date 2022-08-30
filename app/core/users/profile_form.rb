# frozen_string_literal: true

module Users
  class ProfileForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String
    attribute :password_confirmation, String
    attribute :timezone, String

    validates :first_name, :last_name, presence: true
    validates :password, strong_password: true, if: :enable_strong_password?
    validate :password_length, unless: -> { password.blank? }
    validates :password_confirmation, presence: true, unless: -> { password.blank? }
    validates_confirmation_of :password, unless: -> { password.blank? }

    validate :validate_project_fields, if: :project?

    def initialize(params = {})
      @params = params
      super
    end

    def password_length
      return unless password

      if context.user.password_length.exclude?(password.size)
        errors.add(:password, :too_short, { count: context.user.password_length.min })
      end
    end

    def validate_project_fields
      field_params = @params[:fields]
      project.profile_setting.profile_fields.includes(:question).each do |field|
        if (field.required || field.question.required_validation['enabled']) &&
           !field_params[field.question_id.to_s.to_sym].present?
          errors.add(field.question.name, 'required')
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
