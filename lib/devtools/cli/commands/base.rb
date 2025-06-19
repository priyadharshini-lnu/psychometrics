# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class Base < Dry::CLI::Command
        def cli_log(data)
          puts data # rubocop:disable Rails/Output
        end

        def cli_error(data)
          puts data # rubocop:disable Rails/Output
          exit(1)
        end

        def current_time_stamp
          Time.current.strftime('%Y%m%d%H%M%S')
        end
      end
    end
  end
end
