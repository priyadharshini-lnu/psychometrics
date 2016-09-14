module Blocks
  module Actions
    module Block
      extend Actions::Action

      action :update do |data, _, block|
        block.update(data)
        block.template.update(data.slice('name', 'props')) if data['template_id']
        nil
      end

      action :rename do |data, _, block|
        block.update(name: data['name'])
        block.template.update(data['template_id'], data.slice('name', 'props')) if data['template_id']
        nil
      end
    end
  end
end
