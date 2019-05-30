module Threesixty
  class Evaluator < ApplicationRecord
    include Threesixty::Participatable

    has_one :subject, foreign_key: :user_id, primary_key: :user_id, inverse_of: :evaluator

    def participant(subject_id)
      participants.find_by(subject_id: subject_id)
    end
  end
end
