# frozen_string_literal: true

class FillProperPropsForCircumplex < ActiveRecord::Migration[5.1]
  def change
    Reports::Module.where(type: 'Graph').find_each do |mod|
      if mod.props['type'] == 'Circumplex' && mod.props['innerCircleRadius'].nil?
        mod.props = mod.props.merge(innerCircleRadius: 60)
        mod.save(validate: false)
      end
    end
  end
end
