# frozen_string_literal: true

class AddUserAccessToAssignsReports < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns_reports, :user_access, :boolean, default: true

    reversible do |dir|
      dir.up do
        AssignsReport.find_each do |assigns_report|
          assigns_report.update_column(:user_access, true)
        end
      end
    end
  end
end
