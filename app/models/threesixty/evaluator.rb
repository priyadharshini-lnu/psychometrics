module Threesixty
  class Evaluator < ApplicationRecord
    belongs_to :user
    belongs_to :campaign, class_name: '::Campaign'
    has_one :subject, foreign_key: :user_id, primary_key: :user_id, inverse_of: :evaluator

    enum role: { common: 0, manager: 1 }
  end
end
