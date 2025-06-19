# frozen_string_literal: true

require 'dry/cli'
require_relative 'cli/commands/assign_user_report'
require_relative 'cli/commands/I18n/translation_changes'
require_relative 'cli/commands/send_email'

module Devtools
  module CLI
    extend Dry::CLI::Registry

    register 'assign-user-report', Devtools::CLI::Commands::AssignUserReport
    register 'send-email', Devtools::CLI::Commands::SendEmail

    register 'I18n' do |prefix|
      prefix.register 'translation_changes', Devtools::CLI::Commands::I18n::TranslationChanges
    end
  end
end
