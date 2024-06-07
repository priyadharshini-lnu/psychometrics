class CreateRegistrationSetting < ActiveRecord::Migration[7.1]
  def change
    create_table :registration_settings do |t|
      t.boolean :require_mobile_number, default: false
      
      t.timestamps
    end

    add_reference :registration_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false
    Client.projects.find_each(&:create_registration_setting)
  end
end
