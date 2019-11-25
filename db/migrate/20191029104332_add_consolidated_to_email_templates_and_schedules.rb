# frozen_string_literal: true

class AddConsolidatedToEmailTemplatesAndSchedules < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_email_templates, :consolidated, :boolean, default: false, null: false
    add_column :threesixty_email_schedules, :consolidated, :boolean, default: false, null: false
  end
end
