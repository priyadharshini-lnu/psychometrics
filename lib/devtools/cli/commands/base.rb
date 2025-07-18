# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class Base < Dry::CLI::Command
        def cli_log(data, log_type = :info)
          prefix = case log_type
                     when :warn
                       '⚠️  Warning: '
                     when :error
                       '❌ Error: '
                     when :success
                       '✅ '
                     else
                       ''
                   end

          puts "#{prefix}#{data}"
        end

        def cli_error(data)
          cli_log(data, :error)
          exit(1)
        end

        def current_time_stamp
          @current_time_stamp ||= Time.current.strftime('%Y%m%d%H%M%S')
        end
      end
    end
  end
end
