class CreateAssessments < ActiveRecord::Migration[5.0]
  def change
    execute <<-SQL
      CREATE TYPE assessment_categories AS ENUM ('psychometric', 'organisational', '360');
    SQL

    create_table :assessments do |t|
      t.string :name
      t.column :category, :assessment_categories, default: :psychometric
      t.references :norm, index: true
      t.boolean :disabled, default: false

      t.timestamps
    end
  end
end
