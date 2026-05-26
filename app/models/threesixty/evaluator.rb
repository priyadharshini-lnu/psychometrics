# frozen_string_literal: true

module Threesixty
  class Evaluator < ApplicationRecord
    audited

    include Threesixty::Participator

    has_many :participants, primary_key: :user_id
    has_one :self_subject,
            -> { where('threesixty_evaluators.campaign_id = threesixty_subjects.campaign_id') },
            foreign_key: :user_id, primary_key: :user_id,
            class_name: 'Threesixty::Subject'

    include Tenantable

    def participant(subject_id)
      participants.find_by(subject_id: subject_id)
    end
  end
end
