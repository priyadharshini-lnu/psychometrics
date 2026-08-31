# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :locale, String
      attribute :current_job_role, String
      attribute :target_job_role, String
      attribute :is_uat, Boolean, default: false

      validates :email, :first_name, :last_name, presence: true
      validates :email, format: { with: Devise.email_regexp }
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
      validate :check_existing
      validate :validate_job_roles
      validate :ensure_current_and_target_job_roles_are_different

      private

      def check_existing
        if ::Threesixty::Subject.joins(:user).exists?(campaign: context.campaign, users: { email: email })
          errors.add(:email, :already_exists)
        end
      end

      def validate_job_roles
        validate_job_role(:current_job_role)
        validate_job_role(:target_job_role)
      end

      def validate_job_role(role_attribute)
        role_name = send(role_attribute)
        return if role_name.blank?

        project = context.campaign.project
        unless JobRole.exists?(name: role_name, project: project)
          errors.add(:base,
                     I18n.t('activemodel.errors.models.create_one.attributes.job_role.not_found', name: role_name))
        end
      end

      def ensure_current_and_target_job_roles_are_different
        return if current_job_role.blank? || target_job_role.blank?

        if current_job_role == target_job_role
          errors.add(:base, I18n.t('activemodel.errors.models.create_one.attributes.job_role.cannot_be_same'))
        end
      end
    end
  end
end
