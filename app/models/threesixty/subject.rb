module Threesixty
  class Subject < ApplicationRecord
    belongs_to :user
    belongs_to :campaign
  end
end
