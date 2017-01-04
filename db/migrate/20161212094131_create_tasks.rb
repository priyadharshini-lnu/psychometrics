class CreateTasks < ActiveRecord::Migration[5.0]
  def change
    create_table :tasks do |t|
      t.belongs_to :membership
      t.belongs_to :factor
      t.belongs_to :assessment
      t.string :name
      t.text :description
      t.integer :priority
      t.integer :status
      t.datetime :planned_completed_at
      t.datetime :completed_at

      t.timestamps
    end
  end
end
