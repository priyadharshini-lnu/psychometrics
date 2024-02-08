class AddAllowLateCancellationAndReschedulingToWorkshop < ActiveRecord::Migration[7.1]
  def change
    add_column :workshops, :allow_late_cancellation_and_rescheduling, :boolean, default: false, null: false

    # Update existing records
    reversible do |dir|
      dir.up { Workshop.update_all(allow_late_cancellation_and_rescheduling: true) }
    end
  end
end
