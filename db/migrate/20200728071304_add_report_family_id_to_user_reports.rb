# frozen_string_literal: true

class AddReportFamilyIdToUserReports < ActiveRecord::Migration[5.1]
  def change
    add_reference :user_reports, :report_family, foreign_key: { on_delete: :restrict }
  end
end
