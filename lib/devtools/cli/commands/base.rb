# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class Base < Dry::CLI::Command
        def cli_log(data)
          puts data # rubocop:disable Rails/Output
        end
      end
    end
  end
end
