module Actions
  module Block
    extend Actions::Action

    action :create do |data, _current_administrator, assessment|
      assessment.blocks.create!(data)
    end

    action :update do |data|
      id = data.delete('id')
      ::Block.update(id, data)
    end

    action :destroy do
      raise 'should be impl'
    end

    action :rename do
      raise 'should be impl'
    end

    action :move_up do
      ::Block.find(data['id']).move_higher
    end

    action :move_down do
      ::Block.find(data['id']).move_lower
    end

    action :restore do
      raise 'should be impl'
    end

    action :permanent_destroy do |data|
      ::Block.delete(data['id'])
      {}
    end
  end
end
