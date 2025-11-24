# frozen_string_literal: true

# Custom i18n validation tasks for duplicate keys and generic key placement
module I18nValidationTasks
end

# Only load when i18n-tasks is available (not in Rails context)
if defined?(I18n::Tasks) && !defined?(Rails)
  require_relative 'i18n_validation_tasks/duplicate_key_validator'
  require_relative 'i18n_validation_tasks/generic_key_validator'
  require_relative 'i18n_validation_tasks/locale_file_utils'

  module I18nValidationTasks
    include ::I18n::Tasks::Command::Collection
    include ::I18n::Tasks::Logging

    cmd :validate_keys, desc: 'validate translation keys for duplicates and generic key placement'
    def validate_keys(_opts = {})
      errors = []

      # Check for duplicate keys across all locale files
      errors.concat(check_duplicate_keys_all_locales)

      # Check for generic keys that should be moved to shared parent (using en.yml as reference)
      errors.concat(check_generic_key_placement_all_locales)

      if errors.empty?
        log_stderr '✅ All translation keys are valid across all locale files!'
      else
        log_stderr "❌ Found #{errors.size} validation errors:"
        errors.each { |error| log_stderr "  - #{error}" }
        raise StandardError, "Found #{errors.size} validation errors"
      end
    end

    cmd :check_duplicates, desc: 'check for duplicate translation keys across all locale files'
    def check_duplicates(_opts = {})
      errors = check_duplicate_keys_all_locales

      if errors.empty?
        log_stderr '✅ No duplicate keys found!'
      else
        log_stderr '❌ Found duplicate keys:'
        errors.each { |error| log_stderr "  - #{error}" }
      end
    end

    cmd :check_generic_placement, desc: 'check for generic keys that should be in shared parent across all locale files'
    def check_generic_placement(_opts = {})
      errors = check_generic_key_placement_all_locales

      if errors.empty?
        log_stderr '✅ All generic keys are properly placed!'
      else
        log_stderr '💡 Suggestions for generic key placement:'
        errors.each { |error| log_stderr "  - #{error}" }
      end
    end

    private

    def get_all_locale_files
      LocaleFileUtils.get_all_locale_files
    end

    def check_duplicate_keys_all_locales
      locale_files = get_all_locale_files
      DuplicateKeyValidator.check_all_locales(locale_files)
    end

    def check_generic_key_placement_all_locales
      locale_files = get_all_locale_files
      GenericKeyValidator.check_all_locales(locale_files)
    end
  end

  I18n::Tasks.add_commands I18nValidationTasks
end
