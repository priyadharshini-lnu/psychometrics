# frozen_string_literal: true

class PrivacyConsent < ApplicationRecord
  audited

  belongs_to :membership
  belongs_to :user

  before_save :set_policy_type

  enum :policy_type, { default: 0, custom: 1 }

  private

  def set_policy_type
    self.policy_type = user.project.custom_privacy_consent? ? :custom : :default
  end
end
