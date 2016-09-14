module Assessments
  module Actions
    module Block
      extend Actions::Action

      action :filter do |data|
        blocks = ::Block.where("name ILIKE ?", "%#{data['q']}%").where(view: :templates).limit(10)
        blocks.map { |block| { value: block.id, label: block.name } }
      end

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

      action :create_by_template do |data, _, assessment|
        # TODO: should be implemented
      end

      action :save_as_template do |data, _, assessment|
        # TODO: need to manage questions (save templates, unlink currents questions)
        block = ::Block.find(data['id'])
        template = block.dup_for_template
        template.save
        block.update_attribute(:template_id, template.id)
        BlockSerializer.new(block).to_hash(include: '**')
      end

      action :unlink_template do |data|
        # TODO: should be implemented
        nil
      end
    end
  end
end
