module Actions
  module Action
    def action(action_name, &block)
      module_name = name.downcase.split('::').last
      define_method "#{module_name}_#{action_name}" do |data|
        puts "#{module_name}_#{action_name}"
        begin
        a = block.call(data)
        # merge noticication
        # merge action
        send
        rescue
          send ()
        end
      end



    end

    def send

    end
  end
end