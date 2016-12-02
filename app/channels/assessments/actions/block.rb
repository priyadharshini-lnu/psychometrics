module Assessments
  module Actions
    module Block
      extend Actions::Action

      action :filter do |data|
        blocks = ::Block.where("name ILIKE ?", "%#{data['q']}%").where(view: :templates).limit(10)
        blocks.map { |block| { value: block.id, label: block.name } }
      end

      action :create do |data, _current_user, assessment|
        block = assessment.blocks.create!(data)
        BlockSerializer.new(block).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Block.update(id, data)
        nil
      end

      action :destroy do |data|
        block = ::Block.find(data['id'])
        block.update(deleted_at: Time.now)
        block.remove_from_list
        block.questions.update_all(deleted_at: Time.now)
        nil
      end

      action :rename do |data|
        block = ::Block.find(data['id'])
        block.update(name: data['name'])
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
        block.move_to_bottom
        BlockSerializer.new(block).to_hash
      end

      action :permanent_destroy do |data|
        ::Block.destroy(data['id'])
        nil
      end

      action :clone do |data|
        block = ::Block.find(data['id'])
        cloned_block = block.clone(name: data['name'], position: data['position'])
        BlockSerializer.new(cloned_block).to_hash
      end

      action :create_by_template do |data, _, assessment|
        template = ::Block.templates.find(data['template_id'])
        block = template.dup_for_assessment!(assessment.id)
        BlockSerializer.new(block).to_hash(include: '**')
      end

      action :save_as_template do |data, _, assessment|
        block = ::Block.find(data['id'])
        block.dup_for_template!
        BlockSerializer.new(block).to_hash(include: '**')
      end

      action :unlink_template do |data|
        block = ::Block.includes(:template, questions: :template).find(data['id'])
        block.update_attributes(block.template.general_attributes.merge({template_id: nil}))
        block.questions.each do |question|
          question.update_attributes(question.template.general_attributes.merge({template_id: nil}))
        end
        BlockSerializer.new(block).to_hash(include: '**')
        nil
      end
    end
  end
end
