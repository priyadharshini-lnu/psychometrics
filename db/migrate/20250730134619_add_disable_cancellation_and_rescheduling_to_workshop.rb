# frozen_string_literal: true

class AddDisableCancellationAndReschedulingToWorkshop < ActiveRecord::Migration[7.1]
  def change
    add_column :workshops, :disable_cancellation_and_rescheduling, :boolean, default: false, null: false
  end
end
