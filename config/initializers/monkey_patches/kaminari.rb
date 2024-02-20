# frozen_string_literal: true

module Kaminari
  module Helpers
    class Paginator
      def as_json
        'noop'
      end
    end
  end
end
