class AddEnabledFieldsToProfileSetting < ActiveRecord::Migration[7.1]
  def change
    add_column :profile_settings, :enabled_default_fields, :json, default: {age: true, gender: true, photo: true}
  end
end
