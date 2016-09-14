module Blocks
  module Actions
    module Block
      extend Actions::Action

      action :update do |data, _, block|
        block.update(id, data)
        nil
      end

      action :rename do |data, _, block|
        block.update(name: data['name'])
        nil
      end
    end
  end
end
