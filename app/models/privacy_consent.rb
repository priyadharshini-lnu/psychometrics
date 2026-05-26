# frozen_string_literal: true

class PrivacyConsent < ApplicationRecord
  audited

  belongs_to :membership
  belongs_to :user
  belongs_to :campaign, optional: true
  belongs_to :assessment, optional: true

  include Tenantable

  tenant_source :user

  before_save :set_policy_type
  before_save :set_data_role

  enum :policy_type, { default: 0, custom: 1 }
  enum :data_role, { processor: 0, controller: 1 }, prefix: true

  private

  def set_policy_type
    self.policy_type = if assessment_id.present? && data_role_controller?
                         :custom
                       else
                         user.project.custom_privacy_consent? ? :custom : :default
                       end
  end

  def set_data_role
    self.data_role = assessment_id.present? ? assessment.data_role : :processor
  end
end
