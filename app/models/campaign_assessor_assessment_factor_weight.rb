# frozen_string_literal: true

class CampaignAssessorAssessmentFactorWeight < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :factor
  include Tenantable
end
