module Threesixty
  class Subject < ApplicationRecord
    belongs_to :user
    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :evaluator, foreign_key: :user_id, primary_key: :user_id, inverse_of: :subject
    has_many :subjects_relationships, primary_key: :user_id
    has_many :participants, foreign_key: :subject_id, primary_key: :user_id
    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report

    def participant_role(evaluator_id)
      participants.where(evaluator_id: evaluator_id).includes(:relationship).first.relationship
    end

    def evaluators
      ids = participants.where(campaign_id: campaign_id).map(&:evaluator_id)
      Threesixty::Evaluator.where(user_id: ids)
    end
  end
end
