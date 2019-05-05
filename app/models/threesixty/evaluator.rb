module Threesixty
  class Evaluator < ApplicationRecord
    belongs_to :user
    has_many :participants, foreign_key: :evaluator_id, primary_key: :user_id
    belongs_to :campaign, class_name: '::Campaign'
    has_one :subject, foreign_key: :user_id, primary_key: :user_id, inverse_of: :evaluator

    def participant(subject_id)
      participants.where(subject_id: subject_id).first
    end

    def participant_role(subject_id)
      participants.where(subject_id: subject_id).includes(:relationship).first.relationship
    end
  end
end
