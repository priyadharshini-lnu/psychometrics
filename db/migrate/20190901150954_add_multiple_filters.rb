class AddMultipleFilters < ActiveRecord::Migration[5.1]
  def change
    Reports::Module.where(type: 'Graph').find_each do |m|
      if m.props['type'] == 'Radar'
        new_filters = m.props['filter'] ? Array.wrap(m.props['filter']) : []
        m.props = m.props.merge(filter: new_filters)
        m.save(validate: false)
      end
    end
  end
end
