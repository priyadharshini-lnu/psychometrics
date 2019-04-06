module Threesixty
  class Subject < ApplicationRecord
    belongs_to :campaigns_user
    belongs_to :campaign
  end
end
