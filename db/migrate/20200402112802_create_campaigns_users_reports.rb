# frozen_string_literal: true

class CreateCampaignsUsersReports < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns_users_reports do |t|
      t.belongs_to :report, foreign_key: { on_delete: :restrict }
      t.belongs_to :user, foreign_key: { on_delete: :restrict }
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.boolean :user_access, null: false, default: false
      t.integer :status, default: 0
      t.string :pdf
    end
  end
end
