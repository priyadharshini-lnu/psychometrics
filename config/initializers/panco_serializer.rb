# frozen_string_literal: true

require 'panko_override/serializer'
require 'panko_override/array_serializer'

module Panko
  class Serializer
    include PankoOverride::Serializer

    class << self
      alias old_inherited inherited
      alias old_attributes attributes

      def inherited(subclass)
        old_inherited(subclass)

        subclass.instance_eval do
          def attributes(*args)
            old_attributes(*args)
            declared_attributes = args.select { |a| a.is_a?(Symbol) || a.is_a?(String) }

            delegate(*(declared_attributes - new.public_methods), to: :object)
          end
        end
      end
    end
  end

  class ArraySerializer
    include PankoOverride::ArraySerializer
  end
end
