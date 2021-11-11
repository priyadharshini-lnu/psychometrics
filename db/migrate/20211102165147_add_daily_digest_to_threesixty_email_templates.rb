# frozen_string_literal: true

class AddDailyDigestToThreesixtyEmailTemplates < ActiveRecord::Migration[5.2]
  def change
    add_column :threesixty_email_templates, :daily_digest, :boolean
    add_column :threesixty_email_templates, :schedule_time, :string
  end
end
