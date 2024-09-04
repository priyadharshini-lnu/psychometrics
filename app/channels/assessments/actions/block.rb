# frozen_string_literal: true

module Assessments
  module Actions
    module Block
      extend Actions::Action

      action :filter do |data|
        blocks = ::Block.where('name ILIKE ?', "%#{data['q']}%").where(view: :templates).
                 where(owner_id: [data['owner_id'], nil]).limit(10)
        blocks.map { |block| { value: block.id, label: block.name } }
      end

      action :create do |data, _current_user, assessment|
        block = assessment.blocks.create!(data)
        BlockSerializer.new.serialize(block)
      end

      action :update do |data|
        id = data.delete('id')
        ::Block.update(id, data)
        nil
      end

      action :destroy do |data|
        block = ::Block.find(data['id'])
        block.update(deleted_at: Time.zone.now)
        block.remove_from_list
        block.questions.update_all(deleted_at: Time.zone.now)
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
        BlockSerializer.new.serialize(block)
      end

      action :move_down do |data|
        block = ::Block.find(data['id'])
        block.move_lower
        BlockSerializer.new.serialize(block)
      end

      action :restore do |data|
        block = ::Block.find(data['id'])
        block.update(deleted_at: nil)
        block.move_to_bottom
        BlockSerializer.new.serialize(block)
      end

      action :permanent_destroy do |data|
        ::Block.destroy(data['id'])
        nil
      end

      action :clone do |data|
        block = ::Block.find(data['id'])
        cloned_block = block.clone_with_params(name: data['name'], position: data['position'])
        BlockSerializer.new.serialize(cloned_block)
      end

      action :create_by_template do |data, _, _assessment|
        template = ::Block.templates.find(data['template_id'])
        Assessments::Actions::Block::CreateByTemplate::BlockSerializer.new(
          context: {
            include: '**'
          }
        ).serialize(template)
      end

      action :save_as_template do |data, _, _assessment|
        block = ::Block.find(data['id'])
        block.dup_for_template!
        BlockSerializer.new(
          context: {
            include: '**'
          }
        ).serialize(block)
      end

      action :unlink_template do |data|
        block = ::Block.includes(:template, questions: :template).find(data['id'])
        block.update(block.template.general_attributes.merge(template_id: nil))
        block.questions.each do |question|
          question.update(question.template.general_attributes.merge(template_id: nil))
        end
        BlockSerializer.new(
          context: {
            include: '**'
          }
        ).serialize(block)
        nil
      end
    end
  end
end
