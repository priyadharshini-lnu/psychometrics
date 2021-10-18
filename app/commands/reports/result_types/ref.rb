# frozen_string_literal: true

module Reports
  module ResultTypes
    class Ref < BaseType
      def call
        context.refs[data['ref']]
      end
    end
  end
end
