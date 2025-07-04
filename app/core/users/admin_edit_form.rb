# frozen_string_literal: true

module Users
  class AdminEditForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :email, String
    attribute :current_job_role, String
    attribute :target_job_role, String

    validate :validate_job_roles

    validates :first_name, :last_name, presence: true
    validates :first_name, :last_name, :email, csv_injection_check: true

    private

    def validate_job_roles
      return if current_job_role.blank? || target_job_role.blank?

      if current_job_role == target_job_role
        errors.add(:base, I18n.t('activemodel.errors.models.create_one.attributes.job_role.cannot_be_same'))
      end
    end
  end
end
