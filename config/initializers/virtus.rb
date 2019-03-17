module Virtus
  module Extensions
    Methods.module_eval do
      def attribute(name, type = nil, options = {})
        if name.is_a?(Array)
          name.each do |n|
            attribute(n, type, options)
          end
        else
          assert_valid_name(name)
          attribute_set << Attribute.build(type, options.merge(name: name))
          self
        end
      end
    end
  end
end
