class Results < ActiveRecord::Migration[5.0]
  def change
    create_table :results do |t|
      t.string :status
      t.integer :step
      t.json :props
      t.timestamps
    end
    add_reference :results, :user
    add_reference :results, :client
    add_reference :results, :assessment
  end
end
