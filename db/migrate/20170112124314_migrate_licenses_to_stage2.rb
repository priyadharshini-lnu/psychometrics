class MigrateLicensesToStage2 < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :licenses_final_expire, :date
    add_column :clients, :licenses_count, :integer, default: 0
    remove_column :clients, :licenses, :integer
    remove_column :clients, :licenses_used, :integer
  end
end
