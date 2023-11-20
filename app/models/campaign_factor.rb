# frozen_string_literal: true

class CampaignFactor < ApplicationRecord
  belongs_to :campaign_factor_group
  belongs_to :campaign
  belongs_to :factor
  belongs_to :assessment

  has_many :campaign_factor_values, dependent: :destroy

  enum factor_type:  { assessment: 0, datasheet: 1, assessor_scoring: 2, formula: 3 }
  enum output_type:  { numeric: 0, string: 1 }
end
