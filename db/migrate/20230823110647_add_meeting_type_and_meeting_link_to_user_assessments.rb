class AddMeetingTypeAndMeetingLinkToUserAssessments < ActiveRecord::Migration[7.0]
  def change
    add_column :user_assessments, :meeting_type, :integer, default: 0
    add_column :user_assessments, :meeting_link, :string
  end
end
