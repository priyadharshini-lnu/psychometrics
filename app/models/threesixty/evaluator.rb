module Threesixty
  class Evaluator < ApplicationRecord
    belongs_to :user
    has_many :participants, foreign_key: :evaluator_id, primary_key: :user_id
    has_many :active_participants, -> { active }, foreign_key: :evaluator_id, primary_key: :user_id,  class_name: '::Participant'
    belongs_to :campaign, class_name: '::Campaign'
    has_one :subject, foreign_key: :user_id, primary_key: :user_id, inverse_of: :evaluator
  end
end
