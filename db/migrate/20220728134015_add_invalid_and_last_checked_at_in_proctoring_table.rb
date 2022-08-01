# frozen_string_literal: true

class AddInvalidAndLastCheckedAtInProctoringTable < ActiveRecord::Migration[5.2]
  def change
    add_column :proctoring_sessions, :invalid_session, :boolean, default: false
    add_column :proctoring_sessions, :last_status_checked_at, :datetime
  end
end
