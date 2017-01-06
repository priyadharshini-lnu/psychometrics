class CreateLicenseUsages < ActiveRecord::Migration[5.0]
  def change
    create_table :license_usages do |t|
      t.references :license
      t.references :licenseable, polymorphic: true
    end
  end
end
