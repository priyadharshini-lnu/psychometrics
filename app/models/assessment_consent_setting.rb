# frozen_string_literal: true

class AssessmentConsentSetting < ApplicationRecord
  extend Mobility

  belongs_to :assessment

  translates :custom_consent_text, :custom_acknowledgment_text

  include Tenantable

  tenant_source :assessment
end
