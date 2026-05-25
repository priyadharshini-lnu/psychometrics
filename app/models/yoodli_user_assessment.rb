# frozen_string_literal: true

class YoodliUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, :users_result, to: :user_assessment
end
