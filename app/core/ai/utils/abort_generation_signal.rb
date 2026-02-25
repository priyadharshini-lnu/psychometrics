# frozen_string_literal: true

# Signal raised when generation should be aborted due to missing or insufficient dependencies.

module AI
  module Utils
    class AbortGenerationSignal < StandardError; end
  end
end
