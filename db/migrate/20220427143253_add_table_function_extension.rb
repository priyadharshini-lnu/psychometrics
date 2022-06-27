# frozen_string_literal: true

class AddTableFunctionExtension < ActiveRecord::Migration[5.2]
  def change
    enable_extension 'tablefunc' unless extension_enabled?('tablefunc')
  end
end
