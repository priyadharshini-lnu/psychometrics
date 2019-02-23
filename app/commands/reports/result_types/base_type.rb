module Reports
  module ResultTypes
    class BaseType
      attr_reader :context, :data

      def initialize(context, data)
        @context = context
        @data = data
      end

      def self.call(context, data)
        instance = self.new(context, data)
        instance.call
      end
    end
  end
end
