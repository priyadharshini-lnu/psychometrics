# frozen_string_literal: true

module Campaigns
  module Users
    module Import
      class CreateForm < Rectify::Form
        mimic :user

        attribute :first_name, String
        attribute :last_name, String
        attribute :email, String
        attribute :active, Boolean
        attribute :mobile_number, String
        attribute :operation, String
        attribute :password, String
        attribute :locale, String
        attribute :schedule_start_date, DateTime
        attribute :schedule_end_date, DateTime
        attribute :manager_id, Integer
        attribute :is_uat, Boolean, default: false
        attribute :external_id, String, default: nil
        attribute :current_job_role, String, default: nil
        attribute :target_job_role, String, default: nil
        attribute :level, String, default: nil

        validates :first_name, :last_name, :email, presence: true
        validates :email, format: { with: Devise.email_regexp }
        validates :mobile_number, format: { with: /\A\+(?:[0-9] ?){6,14}[0-9]\z/ }, allow_blank: true
        validates :operation, inclusion: { in: %w[skip_existing add_with_existing_response add_and_allow_new_response] }
        validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
        validates :level, inclusion: {
          in: CampaignUser.levels.keys,
          message: I18n.t('admin.level_validation_message', values: CampaignUser.levels.keys.join(', '))
        }, allow_blank: true
        validate :user_exists_in_project, if: -> { operation == 'skip_existing' }
        validates_length_of :password, within: Devise.password_length, allow_blank: true

        validates_datetime :schedule_start_date, allow_blank: true
        validates_datetime :schedule_end_date, allow_blank: true

        validate :validate_job_roles
        validate :ensure_current_and_target_job_roles_are_different

        def user_exists_in_project
          if User.exists?(project_id: campaign.project_id, email: email) && !campaign.users.exists?(email: email)
            errors.add(:email, :user_exists_in_project)
          end
        end

        def active
          super.nil? || super
        end

        def is_uat # rubocop:disable Naming/PredicatePrefix
          super == true
        end

        def validate_job_roles
          validate_job_role(:current_job_role)
          validate_job_role(:target_job_role)
        end

        def validate_job_role(role_attribute)
          role_name = send(role_attribute)
          return if role_name.blank?

          unless JobRole.exists?(name: role_name, project: project)
            errors.add(role_attribute, :not_found, name: role_name)
          end
        end

        def ensure_current_and_target_job_roles_are_different
          return if current_job_role.blank? || target_job_role.blank?

          if current_job_role == target_job_role
            errors.add(:base, I18n.t('activemodel.errors.models.import_one.attributes.job_role.cannot_be_same'))
          end
        end

        private

        def project
          @project ||= campaign.project
        end

        def campaign
          context.campaign
        end
      end
    end
  end
end
