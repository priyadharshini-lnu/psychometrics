module Threesixty
  class Evaluator < ApplicationRecord
    belongs_to :user
    belongs_to :campaign, class_name: '::Campaign'
  end
end
