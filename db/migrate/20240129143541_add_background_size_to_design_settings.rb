class AddBackgroundSizeToDesignSettings < ActiveRecord::Migration[7.0]
  def change
    add_column :design_settings, :background_size, :string, default: 'cover'
  end
end
