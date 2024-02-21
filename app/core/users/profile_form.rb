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
    attribute :photo, String

    validates :first_name, :last_name, presence: true
    validate :validate_project_fields, if: :project?
    validate :validate_default_fields, if: :project?
    validate :question_center_validations, if: :project?
    validates :age, numericality: { only_integer: true, greater_than_or_equal_to: 4, less_than_or_equal_to: 150 },
      allow_blank: true

    def validate_project_fields
      project.profile_setting.profile_fields.includes(:question).each do |field|
        if field.required && custom_fields[field.question_id.to_s.to_sym].blank?
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

    def question_center_validations
      project.profile_setting.profile_fields.includes(:question).each do |field|
        question = field.question
        validation_errors = Questions::Validation.call!(question, custom_fields[field.question_id.to_s.to_sym],
                                                        I18n.locale)
        next unless validation_errors

        validation_errors.each do |error|
          errors.add(question.name, error)
        end
      end
    end

    private

    def project?
      project
    end

    def project
      context.project
    end
  end
end
