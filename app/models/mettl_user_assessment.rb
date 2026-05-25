# frozen_string_literal: true

class MettlUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  belongs_to :mettl_schedule_record, optional: true

  delegate :user_reports, to: :user_assessment
  delegate :schedule_name, to: :mettl_schedule_record, allow_nil: true
end
