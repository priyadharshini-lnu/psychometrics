# frozen_string_literal: true

class MhsUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, to: :user_assessment

  validates :confidence_interval, inclusion: { in: [0, 1] }
  validates :leadership_bar, inclusion: { in: [0, 1] }
  validates :norm_region, inclusion: { in: [1, 3, 6, 7] }
  validates :norm_option, inclusion: { in: 0..3 }
end
