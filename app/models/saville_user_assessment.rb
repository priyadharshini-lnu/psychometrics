# frozen_string_literal: true

class SavilleUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, to: :user_assessment

  before_create :set_default_data_seprator, if: proc { data_seprator.nil? }
  before_create :set_default_candidate_id, if: proc { candidate_id.nil? }

  def set_default_data_seprator
    self.data_seprator = user_assessment.campaign.uniq_code
  end

  def set_default_candidate_id
    self.candidate_id = user_assessment.subject_id
  end
end
