#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'
require 'json'
require 'fileutils'
require 'net/http'
require 'uri'

# Microsoft Translator configuration
MICROSOFT_AVAILABLE = ENV.fetch('MICROSOFT_TRANSLATION_API_KEY',
                                nil) && ENV.fetch('MICROSOFT_TRANSLATION_API_REGION', nil)

if MICROSOFT_AVAILABLE
  puts 'Microsoft Translator configured successfully'
else
  puts 'Microsoft Translator not available - using placeholder translations'
  puts 'Please set MICROSOFT_TRANSLATION_API_KEY and MICROSOFT_TRANSLATION_API_REGION'
end

# Microsoft Translator locale mapping (updated to match all locales in config/locales/)
MICROSOFT_LOCALE_MAPPING = {
  'ar' => 'ar',           # Arabic
  'bg' => 'bg',           # Bulgarian
  'cs' => 'cs',           # Czech
  'de' => 'de',           # German
  'el' => 'el',           # Greek (if you add it later)
  'en' => 'en',           # English
  'en-us' => 'en',        # English US
  'es' => 'es',           # Spanish
  'es-es' => 'es',        # Spanish ES
  'et' => 'et',           # Estonian (if you add it later)
  'fi' => 'fi',           # Finnish (if you add it later)
  'fr' => 'fr',           # French
  'he' => 'he',           # Hebrew (if you add it later)
  'hr' => 'hr',           # Croatian
  'hu' => 'hu',           # Hungarian
  'id' => 'id',           # Indonesian
  'it' => 'it',           # Italian
  'ja' => 'ja',           # Japanese
  'ko' => 'ko',           # Korean
  'lt' => 'lt',           # Lithuanian (if you add it later)
  'lv' => 'lv',           # Latvian (if you add it later)
  'nb' => 'nb',           # Norwegian (if you add it later)
  'nl' => 'nl',           # Dutch
  'pl' => 'pl',           # Polish
  'pt' => 'pt',           # Portuguese
  'pt-br' => 'pt',        # Portuguese BR (if you add it later)
  'pt-pt' => 'pt',        # Portuguese PT (if you add it later)
  'ro' => 'ro',           # Romanian
  'ru' => 'ru',           # Russian
  'sk' => 'sk',           # Slovak
  'sl' => 'sl',           # Slovenian
  'sr-cyrl' => 'sr-Cyrl', # Serbian Cyrillic
  'sr-latn' => 'sr-Latn', # Serbian Latin
  'sv' => 'sv',           # Swedish (if you add it later)
  'th' => 'th',           # Thai
  'tr' => 'tr',           # Turkish
  'uk' => 'uk',           # Ukrainian
  'vi' => 'vi',           # Vietnamese
  'zh' => 'zh',           # Chinese
  'zh-hk' => 'zh-Hant',   # Chinese Hong Kong (maps to Traditional)
  'zh-hans' => 'zh-Hans', # Chinese Simplified (if you add it later)
  'zh-hant' => 'zh-Hant'  # Chinese Traditional
}.freeze

class TranslationProcessor
  def initialize
    @changes_made = false
    @microsoft_cache = {}

    if MICROSOFT_AVAILABLE
      puts 'Microsoft Translator configured successfully'
    else
      puts 'Microsoft Translator not available - using placeholder translations'
    end
  end

  def process_new_keys(new_keys_json)
    return false if new_keys_json.nil? || new_keys_json.strip.empty? || new_keys_json == '[]'

    begin
      new_keys = JSON.parse(new_keys_json)
    rescue JSON::ParserError => e
      puts "Error parsing JSON: #{e.message}"
      puts "Raw input: #{new_keys_json}"
      return false
    end

    return false if new_keys.empty?

    puts "Processing #{new_keys.length} new translation keys..."

    new_keys.each do |key_entry|
      file_path = key_entry['file']
      key_path = key_entry['key']
      english_value = key_entry['value']

      process_key(file_path, key_path, english_value)
    end

    @changes_made
  end

  private

  # Retry mechanism with exponential backoff
  def with_retry(max_attempts: 3, delay: 1)
    attempt = 1
    begin
      yield
    rescue StandardError => e
      if attempt < max_attempts
        puts "    Attempt #{attempt} failed: #{e.message}. Retrying in #{delay} seconds..."
        sleep(delay)
        attempt += 1
        delay *= 2 # Exponential backoff
        retry
      else
        puts "    All #{max_attempts} attempts failed. Last error: #{e.message}"
        raise e
      end
    end
  end

  # Protect interpolation variables from translation
  def protect_interpolation_variables(text)
    # Track protected variables for restoration
    @protected_variables ||= {}

    # Protect Rails I18n interpolation variables: %{variable}
    text = text.gsub(/%\{([^}]+)\}/) do |match|
      var_name = ::Regexp.last_match(1)
      placeholder = "<x>#{var_name}</x>"
      @protected_variables[placeholder] = match
      placeholder
    end

    # Protect Mustache/Handlebars style: {{variable}}
    text = text.gsub(/\{\{([^}]+)\}\}/) do |match|
      var_name = ::Regexp.last_match(1)
      placeholder = "<x>#{var_name}_mustache</x>"
      @protected_variables[placeholder] = match
      placeholder
    end

    # Protect HTML-like tags: <tag>content</tag>
    text = text.gsub(%r{<([a-zA-Z][^>]*)>([^<]*)</\1>}) do |match|
      tag_name = ::Regexp.last_match(1)
      content = ::Regexp.last_match(2)
      placeholder = "<x>#{tag_name}_tag_#{content}</x>"
      @protected_variables[placeholder] = match
      placeholder
    end

    # Protect single HTML tags: <tag />
    text.gsub(%r{<([a-zA-Z][^>]*)\s*/>}) do |match|
      tag_name = ::Regexp.last_match(1).split.first
      placeholder = "<x>#{tag_name}_single_tag</x>"
      @protected_variables[placeholder] = match
      placeholder
    end
  end

  # Restore protected interpolation variables after translation
  def restore_interpolation_variables(translated_text)
    return translated_text unless @protected_variables

    # Restore all protected variables
    @protected_variables.each do |placeholder, original|
      translated_text = translated_text.gsub(placeholder, original)
    end

    # Clear the cache for next translation
    @protected_variables.clear

    translated_text
  end

  def process_key(file_path, key_path, english_value)
    filename = File.basename(file_path, '.yml')
    puts "Processing key: #{key_path} in #{filename}"

    # Find existing files in other locales
    existing_files = find_existing_files(filename)

    existing_files.each do |target_file|
      locale = extract_locale_from_path(target_file)
      translated_value = format_and_translate_value(english_value, locale)

      puts "  Updating #{target_file}"
      update_language_file(target_file, locale, key_path, translated_value)
    end
  end

  def find_existing_files(filename)
    Dir.glob("config/locales/*/#{filename}.yml").reject do |file|
      file.include?('/en/')
    end
  end

  def extract_locale_from_path(file_path)
    file_path.match(%r{config/locales/([^/]+)})[1]
  end

  def update_language_file(yaml_file_path, language_code, key_path, value)
    # Load the existing YAML file
    yaml_content = YAML.load_file(yaml_file_path) || {}

    # Split the key path
    keys = key_path.split('.')

    # Check if the key already exists
    existing_value = find_existing_value(yaml_content[language_code], keys)

    if existing_value
      puts "    Key already exists: #{key_path}"
      return
    end

    # Add the key in alphabetical order
    add_key_in_order(yaml_content, language_code, keys, value)

    # Write the updated YAML back to the file
    File.write(yaml_file_path, "#{yaml_to_file(yaml_content)}\n")

    puts "    ✅ Added: #{key_path} = #{value}"
    @changes_made = true
  end

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

  def format_and_translate_value(value, language_code)
    return value if language_code == 'en'

    unless MICROSOFT_AVAILABLE
      return "[#{language_code.upcase}] #{value}" # Fallback
    end

    cache_key = "#{language_code}|#{value}"
    return @microsoft_cache[cache_key] if @microsoft_cache.key?(cache_key)

    # Map the language code to Microsoft Translator target language
    target = get_microsoft_target_language(language_code)

    unless target
      puts "    Warning: Language '#{language_code}' not supported by Microsoft Translator, using fallback"
      return "[#{language_code.upcase}] #{value}"
    end

    begin
      translated_text = with_retry(max_attempts: 3, delay: 2) do
        translate_with_microsoft(value, target)
      end

      @microsoft_cache[cache_key] = translated_text
      translated_text
    rescue StandardError => e
      handle_translation_error(e, language_code)
      "[#{language_code.upcase}] #{value}" # Fallback on error
    end
  end

  def get_microsoft_target_language(language_code)
    # First try direct mapping
    mapped = MICROSOFT_LOCALE_MAPPING[language_code.downcase]
    return mapped if mapped

    # Try with string keys for backwards compatibility
    mapped = MICROSOFT_LOCALE_MAPPING[language_code]
    return mapped if mapped

    nil
  end

  def translate_with_microsoft(text, target_locale)
    # Protect interpolation variables for Microsoft API
    protected_text = protect_interpolation_variables_microsoft(text)

    uri = URI('https://api.cognitive.microsofttranslator.com/translate')
    uri.query = URI.encode_www_form({
      'api-version' => '3.0',
      'to' => target_locale
    })

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request['Ocp-Apim-Subscription-Key'] = ENV.fetch('MICROSOFT_TRANSLATION_API_KEY', nil)
    request['Ocp-Apim-Subscription-Region'] = ENV.fetch('MICROSOFT_TRANSLATION_API_REGION', nil)
    request['Content-Type'] = 'application/json'
    request.body = [{ text: protected_text }].to_json

    response = http.request(request)

    if response.code == '200'
      result = JSON.parse(response.body)
      translated_text = result[0]['translations'][0]['text']
      # Restore interpolation variables
      restore_interpolation_variables_microsoft(translated_text)
    else
      raise "Microsoft Translator API error: #{response.code} - #{response.body}"
    end
  rescue StandardError => e
    raise "Microsoft Translator error: #{e.message}"
  end

  def protect_interpolation_variables_microsoft(text)
    # Replace %{variable} with unique placeholder that won't be translated
    placeholders = {}
    counter = 0

    protected_text = text.gsub(/%\{[^}]+\}/) do |match|
      placeholder = "INTERPOLATION_VAR_#{counter}"
      placeholders[placeholder] = match
      counter += 1
      placeholder
    end

    @interpolation_placeholders = placeholders
    protected_text
  end

  def restore_interpolation_variables_microsoft(text)
    # Restore the original interpolation variables
    return text unless @interpolation_placeholders

    restored_text = text
    @interpolation_placeholders.each do |placeholder, original|
      restored_text = restored_text.gsub(placeholder, original)
    end

    @interpolation_placeholders = nil
    restored_text
  end

  def handle_translation_error(error, language_code)
    puts "    Warning: Translation failed for #{language_code}: #{error.message}"
  end

  def yaml_to_file(yaml_data)
    # First convert to YAML with standard settings
    yaml_string = yaml_data.to_yaml(line_width: -1)
    lines = yaml_string.split("\n")

    # Process lines and return the result
    process_yaml_lines(lines).join("\n")
  end

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

  def string_value_line?(line)
    line =~ /^(\s+)([^:]+):\s+"(.+)"$/
  end

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

  def needs_literal_style?(value)
    value.length > 80 ||
      value.include?('\n') ||
      value.include?(':') ||
      value.start_with?('-') ||
      value.include?('#')
  end

  def add_literal_style_value(indent, key, value, modified_lines)
    # Use literal style for special strings
    modified_lines << "#{indent}#{key}: \"#{value}\""
  end

  def find_existing_value(yaml_content, keys)
    current = yaml_content
    keys.each do |key|
      return nil unless current.is_a?(Hash) && current.key?(key)

      current = current[key]
    end
    current
  end

  def find_existing_keys_with_value(yaml_content, value)
    keys_with_value = []

    traverse_keys(yaml_content) do |key_path, key_value|
      keys_with_value << key_path if key_value == value
    end

    keys_with_value
  end

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

# Main execution
if __FILE__ == $PROGRAM_NAME
  if ARGV.empty?
    puts "Usage: #{$PROGRAM_NAME} <new_keys_json>"
    exit 1
  end

  new_keys_json = ARGV[0]
  processor = TranslationProcessor.new
  changes_made = processor.process_new_keys(new_keys_json)

  # Write result to file for GitHub Actions
  File.write('translation_changes.txt', changes_made.to_s)

  if changes_made
    puts 'Translation files were generated successfully'
    puts 'Files modified:'
    system("git status --porcelain config/locales/ | grep -v '^??' || echo 'No files modified'")
  else
    puts 'No translation files were generated'
  end
end
