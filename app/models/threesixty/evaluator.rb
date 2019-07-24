module Threesixty
  class Evaluator < ApplicationRecord
    include Threesixty::Participatable

    has_many :participants, foreign_key: :evaluator_id, primary_key: :user_id
    has_one :self_subject, foreign_key: :user_id, primary_key: :user_id, inverse_of: :self_evaluator, class_name: 'Threesixty::Subject'

    def participant(subject_id)
      participants.find_by(subject_id: subject_id)
    end
  end
end
