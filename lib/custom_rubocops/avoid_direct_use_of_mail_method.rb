# frozen_string_literal: true

if Object.const_defined?('RuboCop::Cop::Cop')
  module CustomRubocops
    class AvoidDirectUseOfMailMethod < RuboCop::Cop::Cop
      MSG = "Use send_email method instead. It won't send emails to user who shouldn't receive communication"
      RESTRICT_ON_SEND = %i[mail].freeze

      def on_send(node)
        add_offense(node)
      end
    end
  end
else
  # rubocop:disable Lint/EmptyClass
  module CustomRubocops
    class AvoidDirectUseOfMailMethod
    end
  end
  # rubocop:enable Lint/EmptyClass
end
