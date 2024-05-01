# frozen_string_literal: true

class PrivacySetting < ApplicationRecord
  audited

  extend Mobility

  belongs_to :project

  translates :custom_privacy_consent_text
end
