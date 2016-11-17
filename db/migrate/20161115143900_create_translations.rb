class CreateTranslations < ActiveRecord::Migration[5.0]
  def change
    create_table :translations do |t|
      t.references :translateable, polymorphic: true
      t.json :props, default: {}
      t.string :locale, limit: 4

      t.timestamps
    end
  end
end
