module Actions
  module Block
    extend Actions::Action

    action :create do |data, current_administrator, assessment|
      assessment.blocks.create!(data)
    end

    action :update do |data|
      id = data.delete('id')
      ::Block.update(id, data)
    end

    action :destroy do |data|
      ::Block.delete(data['id'])
      {}
    end

    action :rename do
    end

    action :move_up do
    end

    action :move_down do
    end

    action :restore do
    end

    action :permanent_destroy do
    end
  end
end
