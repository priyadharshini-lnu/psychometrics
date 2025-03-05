# frozen_string_literal: true

if Object.const_defined?('RuboCop::Cop::Cop')
  module CustomRubocops
    class AvoidUsingMemoizationInSerializers < RuboCop::Cop::Base
      MSG = 'Avoid using @(Memoized variables) inside panko serializers. https://github.com/yosiat/panko_serializer/issues/59'

      def on_or_asgn(node)
        lhs, _value = *node
        add_offense(node) if lhs.ivasgn_type?
      end
    end
  end
else
  # rubocop:disable Lint/EmptyClass
  module CustomRubocops
    class AvoidUsingMemoizationInSerializers
    end
  end
  # rubocop:enable Lint/EmptyClass
end
