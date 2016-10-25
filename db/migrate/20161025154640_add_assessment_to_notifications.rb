class AddAssessmentToNotifications < ActiveRecord::Migration[5.0]
  def change
    add_reference :notifications, :assessment
  end
end
