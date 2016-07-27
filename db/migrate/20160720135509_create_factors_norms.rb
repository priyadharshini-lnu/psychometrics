class CreateFactorsNorms < ActiveRecord::Migration[5.0]
  def change
    execute <<-SQL
      CREATE TYPE factors_norms_types AS ENUM ('yti', 'eti');
    SQL

    create_table :factors_norms do |t|
      t.string :level
      t.float :score_from
      t.float :score_to
      t.column :type, :factors_norms_types
    end
    add_reference :factors_norms, :factor
    add_reference :factors_norms, :norm
  end
end
