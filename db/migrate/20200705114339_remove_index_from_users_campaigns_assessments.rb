# frozen_string_literal: true

class RemoveIndexFromUsersCampaignsAssessments < ActiveRecord::Migration[5.1]
  def change
    remove_index :users_campaigns_assessments, name: 'participants_subject_evaluator_campaign'
    add_index :users_campaigns_assessments, %i[subject_id evaluator_id campaign_id assessment_id], unique: true,
      name: :sub_eval_campaign_assessment
  end
end
