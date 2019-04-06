module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    belongs_to :report
    belongs_to :assessment
  end
end
