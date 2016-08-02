module Actions
  module Block
    extend Actions::Action

    action :create do |data, _current_administrator, assessment|
      block = assessment.blocks.create!(data)
      BlockSerializer.new(block).serializable_hash
    end

    action :update do |data|
      id = data.delete('id')
      ::Block.update(id, data)
      nil
    end

    action :destroy do |data|
      ::Block.find(data['id']).update(deleted_at: Time.now)
      nil
    end

    action :rename do |data|
      ::Block.find(data['id']).update(name: data['name'])
      nil
    end

    action :move_up do |data|
      ::Block.find(data['id']).update(position: data['position'])
      nil
    end

    action :move_down do |data|
      ::Block.find(data['id']).update(position: data['position'])
      nil
    end

    action :restore do |data|
      block = ::Block.find(data['id'])
      block.update(deleted_at: nil)
      BlockSerializer.new(block).serializable_hash
    end

    action :permanent_destroy do |data|
      ::Block.destroy(data['id'])
      nil
    end
  end
end
