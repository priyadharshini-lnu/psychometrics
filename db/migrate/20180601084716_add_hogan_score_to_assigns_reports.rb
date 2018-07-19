class AddHoganScoreToAssignsReports < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns_reports, :hogan_score, :jsonb, default: {}
  end
end
