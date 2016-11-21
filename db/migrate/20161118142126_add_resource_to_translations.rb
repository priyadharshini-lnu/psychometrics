class AddResourceToTranslations < ActiveRecord::Migration[5.0]
  def change
    add_reference :translations, :resource, polymorphic: true
  end
end
