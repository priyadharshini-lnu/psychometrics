class CreateFactorScoring < ActiveRecord::Migration[5.0]
  def change
    create_table :factors_scoring do |t|
      t.json :props
    end
    add_reference :factors_scoring, :factor
    add_reference :factors_scoring, :assessment
    add_reference :factors_scoring, :question
  end
end
