class AddViewToQuestionsAndBlocks < ActiveRecord::Migration[5.0]
  def change
    add_column :questions, :view, :integer, default: 0, index: true
    add_column :questions, :disabled, :boolean, default: false
    add_reference :questions, :original
    add_column :blocks, :view, :integer, default: 0, index: true
    add_column :blocks, :disabled, :boolean, default: false
    add_reference :blocks, :original
  end
end
