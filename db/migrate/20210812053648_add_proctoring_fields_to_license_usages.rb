# frozen_string_literal: true

class AddProctoringFieldsToLicenseUsages < ActiveRecord::Migration[5.2]
  def change
    add_column :license_usages, :proctoring_session_id, :integer
    add_column :license_usages, :proctoring_credits_debited, :integer
    add_column :license_usages, :proctoring_credits_credited, :integer
    add_column :license_usages, :proctoring_session_duration, :integer
  end
end
