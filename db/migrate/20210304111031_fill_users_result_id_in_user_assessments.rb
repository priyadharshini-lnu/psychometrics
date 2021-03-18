# frozen_string_literal: true

class FillUsersResultIdInUserAssessments < ActiveRecord::Migration[5.2]
  def change
    UserAssessment.joins(:campaign).
      where(campaigns: { type: :threesixty }).
      where(users_result_id: nil).
      find_each do |user_assessment|
      user_result = UsersResult.find_by(user_assessment.slice(:evaluator_id, :subject_id, :campaign_id))

      user_assessment.update(users_result_id: user_result&.id)
    end
  end
end
