# frozen_string_literal: true

require 'dry/cli'
require_relative 'cli/commands/assign_user_report'
require_relative 'cli/commands/export_schema'
require_relative 'cli/commands/I18n/auto_translate_xlsx'
require_relative 'cli/commands/I18n/auto_translate_yml'
require_relative 'cli/commands/I18n/translation_changes'
require_relative 'cli/commands/I18n/translation_import'
require_relative 'cli/commands/send_email'

module Devtools
  module CLI
    extend Dry::CLI::Registry

    register 'assign-user-report', Devtools::CLI::Commands::AssignUserReport
    register 'export-schema', Devtools::CLI::Commands::ExportSchema
    register 'send-email', Devtools::CLI::Commands::SendEmail

    register 'I18n' do |prefix|
      prefix.register 'auto_translate_xlsx', Devtools::CLI::Commands::I18n::AutoTranslateXlsx
      prefix.register 'auto_translate_yml', Devtools::CLI::Commands::I18n::AutoTranslateYml
      prefix.register 'translation_changes', Devtools::CLI::Commands::I18n::TranslationChanges
      prefix.register 'translation_import', Devtools::CLI::Commands::I18n::TranslationImport
    end
  end
end
