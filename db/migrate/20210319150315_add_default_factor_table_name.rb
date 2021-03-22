# frozen_string_literal: true

class AddDefaultFactorTableName < ActiveRecord::Migration[5.2]
  def up
    Reports::Module.where(type: 'Table').find_each do |m|
      if m.props['type'] == 'FactorsTable'
        m.props['showName'] = true
        m.save(validate: false)
      end
    end
  end
end
