module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    belongs_to :report
    belongs_to :assessment
    has_one :option, foreign_key: :threesixty_campaign_id
  end
end
