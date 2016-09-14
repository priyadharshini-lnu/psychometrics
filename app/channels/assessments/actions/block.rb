module Assessments
  module Actions
    module Block
      extend Actions::Action

      action :create do |data, _current_administrator, assessment|
        block = assessment.blocks.create!(data)
        BlockSerializer.new(block).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Block.update(id, data)
        ::Question.update(data['template_id'], data.slice('name', 'props')) if data['template_id']
        nil
      end

      action :destroy do |data|
        block = ::Block.find(data['id'])
        block.update(deleted_at: Time.now)
        block.questions.update_all(deleted_at: Time.now)
        nil
      end

      action :rename do |data|
        block = ::Block.find(data['id'])
        block.update(name: data['name'])
        block.template.update(name: data['name']) if block.template
        nil
      end

      action :move_up do |data|
        block = ::Block.find(data['id'])
        block.move_higher
        BlockSerializer.new(block).to_hash
      end

      action :move_down do |data|
        block = ::Block.find(data['id'])
        block.move_lower
        BlockSerializer.new(block).to_hash
      end

      action :restore do |data|
        block = ::Block.find(data['id'])
        block.update(deleted_at: nil)
        BlockSerializer.new(block).to_hash
      end

      action :permanent_destroy do |data|
        ::Block.destroy(data['id'])
        nil
      end

      action :clone do |data|
        block = ::Block.find(data['id'])
        block.assessment.shift_down_all_blocks(data['position'] - 1)
        cloned_block = block.deep_clone(name: data['name'], position: data['position'])
        BlockSerializer.new(cloned_block).to_hash
      end
    end
  end
end
