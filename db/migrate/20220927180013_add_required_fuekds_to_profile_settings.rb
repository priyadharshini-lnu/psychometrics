class AddRequiredFuekdsToProfileSettings < ActiveRecord::Migration[6.1]
  def change
    add_column :profile_settings, :required_default_fields, :json, default: {}
    add_column :profile_settings, :locked_default_fields, :json, default: {}
  end
end
