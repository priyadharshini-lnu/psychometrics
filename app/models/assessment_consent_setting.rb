# frozen_string_literal: true

class AssessmentConsentSetting < ApplicationRecord
  extend Mobility

  belongs_to :assessment

  translates :custom_consent_text, :custom_acknowledgment_text

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment
end
