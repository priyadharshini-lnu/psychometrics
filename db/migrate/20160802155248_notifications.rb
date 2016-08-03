class Notifications < ActiveRecord::Migration[5.0]
  def change
    create_table :notifications do |t|
      t.string :text
      t.timestamps
    end
  end
end
