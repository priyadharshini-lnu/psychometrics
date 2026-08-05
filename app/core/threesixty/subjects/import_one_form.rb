# frozen_string_literal: true

module Threesixty
  module Subjects
    class ImportOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :password, String
      attribute :locale, String
      attribute :current_job_role, String
      attribute :target_job_role, String

      validate :validate_password_policy
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
      validates :email, :first_name, :last_name, presence: true
      validates :email, format: { with: Devise.email_regexp }

      validate :validate_job_roles
      validate :ensure_current_and_target_job_roles_are_different

      private

      def enable_strong_password?
        context.campaign.project.security_setting.enforce_strong_password
      end

      def validate_password_policy
        return if password.blank?

        unless Devise.password_length.cover?(password.length)
          errors.add(:password, :too_short, count: Devise.password_length.min)
          return
        end

        return unless enable_strong_password?
        return if StrongPasswordValidator::REGEX.match?(password)

        errors.add(:password, I18n.t('activemodel.errors.models.profile.attributes.password.too_weak'))
      end

      def validate_job_roles
        validate_job_role(:current_job_role)
        validate_job_role(:target_job_role)
      end

      def validate_job_role(role_attribute)
        role_name = send(role_attribute)
        return if role_name.blank?

        project = context.campaign.project
        unless JobRole.exists?(name: role_name, project: project) ||
               JobRole.exists?(name: role_name, project_id: nil)
          errors.add(:base,
                     I18n.t('activemodel.errors.models.import_one.attributes.job_role.not_found', name: role_name))
        end
      end

      def ensure_current_and_target_job_roles_are_different
        return if current_job_role.blank? || target_job_role.blank?

        if current_job_role == target_job_role
          errors.add(:base, I18n.t('activemodel.errors.models.import_one.attributes.job_role.cannot_be_same'))
        end
      end
    end
  end
end
