# frozen_string_literal: true

class CampaignTemplate < ApplicationRecord
  audited

  belongs_to :assessment
  belongs_to :report
end
