module Actions
  module Action
    def action(action_name, &block)
      module_name = name.downcase.split('::').last
      define_method "#{module_name}_#{action_name}" do |data|
        puts "#{module_name}_#{action_name}"
        block.call(data)
      end
    end
  end
end