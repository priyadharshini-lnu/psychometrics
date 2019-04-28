class CampaignTemplate < ApplicationRecord
  belongs_to :assessment
  belongs_to :report
end
