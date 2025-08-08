# frozen_string_literal: true

class AddRateLimitsToSmtpSettings < ActiveRecord::Migration[7.1]
  def change
    change_table :smtp_settings, bulk: true do |t|
      t.integer :concurrency_limit, default: 2,  null: false
      t.integer :rate_limit,        default: 90, null: false
      t.integer :rate_limit_period, default: 1,  null: false # minutes
    end
  end
end
