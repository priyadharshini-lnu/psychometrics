# frozen_string_literal: true

module CustomRubocops
  class AvoidDirectUseOfMailMethod < RuboCop::Cop::Cop
    MSG = "Use send_email method instead. It won't send emails to user who shouldn't receive communication"
    RESTRICT_ON_SEND = %i[mail].freeze

    def on_send(node)
      add_offense(node)
    end
  end
end
