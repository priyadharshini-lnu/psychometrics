module Exports
  module External
    class BaseExternalExport

      def self.build(type)
        "Exports::External::#{type.capitalize}Export".constantize.new
      end

      def to_xlsx(assigns)
        raise 'should be implemented in particular external export'
      end
    end
  end
end
