# frozen_string_literal: true

class RenameCpiTopFactors < ActiveRecord::Migration[5.1]
  def up
    Reports::Module.where(type: 'Table').find_each do |m|
      if m.props['type'] == 'CPITopFactors'
        m.props['type'] = 'FactorsTable'
        m.props['mode'] = 'topFactors'
        m.props['showDescription'] = true
        m.props['tableStyle'] = 'default' if m.props['tableStyle'] == 'comfortable'
        m.save(validate: false)
      end
    end
  end
end
