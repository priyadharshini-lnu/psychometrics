# frozen_string_literal: true

require 'yaml'
require 'deepl'

LOCALE_MAPPING = {
  'es-ES': 'es',
  'zh-HK': 'zh-Hant'
}.freeze

class TranslationGenerator < Rails::Generators::Base # rubocop:disable Metrics/ClassLength
  desc 'Adds translation keys to YAML files'
  argument :file_name, type: :string, desc: 'The YAML file to add the translation to (without extension)'
  argument :key_path, type: :string, desc: 'The dot-notation path for the translation key'
  argument :eng_value, type: :string, desc: 'The English(en) value for the translation'
  class_option :normalize, type: :boolean, default: true, desc: 'Normalize the key path (convert to snake_case)'
  class_option :force, type: :boolean, default: false, desc: 'Force overwrite of existing translations without asking'

  def add_translation_keys
    # Normalize the key path by default
    @key_path = normalize_key(key_path) if options[:normalize]
    keys = @key_path ? @key_path.split('.') : key_path.split('.')

    # Get all language directories and validate English directory exists
    locale_dirs = get_and_validate_locale_dirs

    # Process English translations first to determine what to do
    en_dir = locale_dirs.find { |dir| File.basename(dir) == 'en' }
    en_file_path = File.join(en_dir, "#{file_name}.yml")

    # Process user decisions about updating existing translations
    en_yaml_content = YAML.load_file(en_file_path) || {}
    replace_existing, proceed = process_user_decisions(en_yaml_content, keys)

    return unless proceed

    # Now update all language files with the translation
    update_all_language_files(locale_dirs, keys, replace_existing)
  end

  private

  # Get and validate locale directories
  def get_and_validate_locale_dirs
    locale_dirs = if ENV['DEEPL_AUTH_KEY'].nil?
                    # Return only the English directory
                    [Rails.root.join('config/locales/en').to_s]
                  else
                    Dir.glob(Rails.root.join('config/locales/*').to_s).select { |f| File.directory?(f) }
                  end

    # First, check if the file exists in English directory
    en_dir = locale_dirs.find { |dir| File.basename(dir) == 'en' }
    if en_dir.nil?
      raise Thor::Error, 'Error: No English locale directory found'
    end

    en_file_path = File.join(en_dir, "#{file_name}.yml")
    unless File.exist?(en_file_path)
      raise Thor::Error, "Error: File '#{file_name}.yml' doesn't exist in English locale directory"
    end

    locale_dirs
  end

  # Process user decisions about existing translations
  def process_user_decisions(en_yaml_content, keys)
    replace_existing = true
    proceed = true

    # Check if the key already exists in English
    existing_en_value = find_existing_value(en_yaml_content['en'], keys)

    # If key exists in English and we're not forcing an overwrite, ask user what to do
    if existing_en_value && !options[:force]
      replace_existing = ask_about_existing_value(existing_en_value)
    end

    # For English locale, check if the value already exists with a different key
    unless options[:force]
      proceed = check_duplicate_values(en_yaml_content, keys)
    end

    [replace_existing, proceed]
  end

  # Ask user about replacing existing values
  def ask_about_existing_value(existing_en_value)
    say "Key '#{@key_path}' already exists in English with value: #{existing_en_value}", :yellow
    replace_existing = yes?("Do you want to replace it with '#{eng_value}'? (y/n)")
    if replace_existing
      say 'Will replace existing translation in all languages', :green
    else
      say 'Will keep existing translation in all languages', :green
    end
    replace_existing
  end

  # Check if there are duplicate values with different keys
  def check_duplicate_values(en_yaml_content, keys)
    existing_keys = find_existing_keys_with_value(en_yaml_content['en'], eng_value)

    if existing_keys.any? && existing_keys.none?(keys.join('.'))
      display_duplicate_values(existing_keys)
      proceed_with_new_key = yes?("Do you still want to add '#{@key_path}' as a new key? (y/n)")

      if proceed_with_new_key
        say 'Will add as a new key in all languages', :green
        return true
      else
        say 'Cancelled adding new key', :yellow
        return false
      end
    end

    true
  end

  # Display duplicate values to the user
  def display_duplicate_values(existing_keys)
    say 'Found existing key(s) with the same English value:', :yellow
    existing_keys.each_with_index do |key, index|
      say "  #{index + 1}. #{key} = #{eng_value}", :yellow
    end
  end

  # Update all language files with the translation
  def update_all_language_files(locale_dirs, keys, replace_existing)
    locale_dirs.each do |locale_dir|
      language_code = File.basename(locale_dir)
      yaml_file_path = File.join(locale_dir, "#{file_name}.yml")

      # Check if the file exists
      unless File.exist?(yaml_file_path)
        say "Warning: File '#{file_name}.yml' doesn't exist in '#{language_code}' locale directory - skipping", :yellow
        next
      end

      update_language_file(yaml_file_path, language_code, keys, replace_existing)
    end
  end

  # Update a single language file
  def update_language_file(yaml_file_path, language_code, keys, replace_existing)
    # Load the existing YAML file
    yaml_content = YAML.load_file(yaml_file_path) || {}

    # Check if the key already exists
    existing_value = find_existing_value(yaml_content[language_code], keys)

    # Skip if key exists and user chose not to replace
    if existing_value && !replace_existing
      return
    end

    # Set the translation value
    # translation_value = if language_code == 'en'
    #                       eng_value
    #                       else
    #                         "[#{language_code.upcase} translation needed for: #{eng_value}]"
    #                     end

    # Properly format the translation value before adding it
    translated_value = format_and_translate_value(eng_value, language_code)

    if translated_value.nil?
      say "Translation failed for '#{eng_value}' in '#{language_code}'", :red
      return
    end

    # Add the key in alphabetical order
    add_key_in_order(yaml_content, language_code, keys, translated_value)

    # Write the updated YAML back to the file
    File.write(yaml_file_path, "#{yaml_to_file(yaml_content)}\n")

    say "Updated translation in #{yaml_file_path}", :green
    if options[:normalize] && @key_path != key_path
      say "Using normalized key: '#{@key_path}' (original: '#{key_path}')",
          :green
    end
  end

  # Add keys to the YAML structure in alphabetical order
  def add_key_in_order(yaml_content, language_code, keys, value)
    # Ensure the top-level language key exists
    yaml_content[language_code] ||= {}
    current = yaml_content[language_code]

    # Navigate through all but the last key in the path
    keys[0...-1].each do |key|
      current[key] ||= {}
      current = current[key]
    end

    # Set the final key's value
    current[keys.last] = value

    # Sort the keys at each level of the structure
    sort_keys_recursively(yaml_content)
  end

  # Sort keys recursively through the YAML structure
  def sort_keys_recursively(obj)
    if obj.is_a?(Hash)
      # Create a new hash with sorted keys
      sorted = {}
      obj.keys.sort.each do |key|
        # Recursively sort nested hashes
        sorted[key] = sort_keys_recursively(obj[key])
      end

      # Replace the original hash with the sorted one
      obj.clear
      sorted.each do |k, v|
        obj[k] = v
      end
    end

    obj
  end

  # Normalize a key to snake_case
  def normalize_key(key)
    # Split the key path
    key_parts = key.split('.')

    # Normalize each part
    normalized_parts = key_parts.map do |part|
      # Convert to snake_case
      snake_case = part.to_s.underscore.downcase

      # Remove any non-alphanumeric characters (except underscores)
      snake_case.gsub(/[^a-z0-9_]/, '')
    end

    # Join the normalized parts
    normalized_parts.join('.')
  end

  # Format translation values to handle special cases
  def format_and_translate_value(value, language_code)
    return value unless ENV['DEEPL_AUTH_KEY']
    return value if language_code == 'en'

    target = LOCALE_MAPPING[language_code.to_sym] || language_code

    translation = DeepL.translate value, 'EN', target

    translation.text
  rescue StandardError
    nil
  end

  # Convert YAML to string with proper formatting for translations
  def yaml_to_file(yaml_data)
    # First convert to YAML with standard settings
    yaml_string = yaml_data.to_yaml(line_width: -1)
    lines = yaml_string.split("\n")

    # Process lines and return the result
    process_yaml_lines(lines).join("\n")
  end

  # Process each line in the YAML string
  def process_yaml_lines(lines)
    modified_lines = []

    lines.each do |line|
      if string_value_line?(line)
        process_string_value_line(line, modified_lines)
      else
        # Not a string value line, keep as is
        modified_lines << line
      end
    end

    modified_lines
  end

  # Check if the line contains a string value
  def string_value_line?(line)
    line =~ /^(\s+)([^:]+):\s+"(.+)"$/
  end

  # Process a line containing a string value
  def process_string_value_line(line, modified_lines)
    match = line.match(/^(\s+)([^:]+):\s+"(.+)"$/)
    return unless match

    indent = match[1]
    key = match[2]
    value = match[3]

    if needs_literal_style?(value)
      add_literal_style_value(indent, key, value, modified_lines)
    else
      # Keep as is for normal strings
      modified_lines << line
    end
  end

  # Check if a value needs literal-style YAML formatting
  def needs_literal_style?(value)
    value.length > 80 ||
      value.include?('\n') ||
      value.include?(':') ||
      value.start_with?('-') ||
      value.include?('#')
  end

  # Add value using literal style YAML formatting
  def add_literal_style_value(indent, key, value, modified_lines)
    # Use literal style for special strings
    modified_lines << "#{indent}#{key}: \"#{value}\""
  end

  # Find existing value for a given key path
  def find_existing_value(yaml_content, keys)
    current = yaml_content
    keys.each do |key|
      return nil unless current.is_a?(Hash) && current.key?(key)

      current = current[key]
    end
    current
  end

  # Find existing keys with the same value
  def find_existing_keys_with_value(yaml_content, value)
    keys_with_value = []

    traverse_keys(yaml_content) do |key_path, key_value|
      keys_with_value << key_path if key_value == value
    end

    keys_with_value
  end

  # Traverse all keys in the YAML content
  def traverse_keys(obj, parent_key = '', &)
    if obj.is_a?(Hash)
      obj.each do |key, value|
        current_key = parent_key.empty? ? key : "#{parent_key}.#{key}"
        traverse_keys(value, current_key, &)
      end
    else
      yield(parent_key, obj)
    end
  end
end
