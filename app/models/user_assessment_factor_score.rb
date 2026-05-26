# frozen_string_literal: true

class UserAssessmentFactorScore < ApplicationRecord
  belongs_to :user_assessment
  belongs_to :factor
  include Tenantable

  tenant_source :user_assessment
end
