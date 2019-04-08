module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    validates :assessment_id, presence: true
    validates :report_id, presence: true

  end
end
