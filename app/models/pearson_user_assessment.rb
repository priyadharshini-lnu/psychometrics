# frozen_string_literal: true

class PearsonUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, to: :user_assessment
end
