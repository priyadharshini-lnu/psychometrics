module Reports
  module ResultTypes
    class BaseType < Rectify::Command
      attr_reader :context, :data

      def initialize(context, data)
        @context = context
        @data = data
      end
    end
  end
end
