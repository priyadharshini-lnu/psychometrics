class AddVersionOnPrivacyConsents < ActiveRecord::Migration[6.1]
  def change
    add_column :privacy_consents, :version, :integer, limit: 2, null: false, default: 1
  end
end
