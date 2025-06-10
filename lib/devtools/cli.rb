# frozen_string_literal: true

require 'dry/cli'
require_relative 'cli/commands/assign_user_report'

module Devtools
  module CLI
    extend Dry::CLI::Registry

    register 'assign-user-report', Devtools::CLI::Commands::AssignUserReport
  end
end
