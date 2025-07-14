#!/usr/bin/env ruby
# frozen_string_literal: true

require 'yaml'
require 'json'
require 'open3'

class TranslationKeyFinder
  def initialize(base_ref = 'develop')
    @base_ref = base_ref
    @all_new_keys = []
  end

  def run
    log '=== Finding new translation keys ==='
    log "Comparing against: origin/#{@base_ref}"

    return output_json([]) unless valid_git_repository?
    return output_json([]) unless base_ref_exists?

    changed_files = get_changed_locale_files
    return output_json([]) if changed_files.empty?

    log "Changed English locale files: #{changed_files.join(', ')}"

    changed_files.each { |file| process_file(file) }

    output_result
  end

  private

  def valid_git_repository?
    success = system('git rev-parse --git-dir > /dev/null 2>&1')
    unless success
      log 'Error: Not in a git repository'
      return false
    end
    true
  end

  def base_ref_exists?
    success = system("git rev-parse origin/#{@base_ref} > /dev/null 2>&1")
    unless success
      log "Error: Base reference 'origin/#{@base_ref}' not found"
      log 'Available remote branches:'
      system('git branch -r | head -10 >&2')
      return false
    end
    true
  end

  def get_changed_locale_files
    output, status = Open3.capture2("git diff origin/#{@base_ref}...HEAD --name-only")
    return [] unless status.success?

    output.lines.
      map(&:strip).
      grep(%r{^config/locales/en/.*\.yml$})
  end

  def process_file(file)
    log "Processing #{file}..."

    unless File.exist?(file)
      log "Warning: File #{file} does not exist, skipping"
      return
    end

    diff_output = get_file_diff(file)
    return if diff_output.empty?

    new_lines = extract_added_lines(diff_output)
    return if new_lines.empty?

    process_new_lines(file, new_lines)
  end

  def get_file_diff(file)
    output, status = Open3.capture2("git diff origin/#{@base_ref}...HEAD -- \"#{file}\"")
    return '' unless status.success?

    output
  end

  def extract_added_lines(diff_output)
    diff_output.lines.
      select { |line| line.start_with?('+') && !line.start_with?('+++') }.
      map { |line| line[1..] } # rubocop:disable Rails/Pluck -- pluck is not available in standalone Ruby
  end

  def process_new_lines(file, new_lines)
    en_content = load_yaml_content(file)

    new_lines.each do |line|
      process_single_line(file, line, en_content)
    end
  end

  def load_yaml_content(file)
    yaml_content = YAML.load_file(file)
    yaml_content['en'] || {}
  rescue StandardError => e
    log "Warning: Could not parse YAML file #{file}: #{e.message}"
    {}
  end

  def process_single_line(file, line, en_content)
    key_value_pair = extract_key_value_from_line(line)
    return unless key_value_pair

    key, clean_value = key_value_pair
    full_keys = find_full_key_paths(en_content, clean_value)

    add_keys_or_fallback(file, key, clean_value, full_keys)
  end

  def extract_key_value_from_line(line)
    match = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/)
    return nil unless match

    key = match[1]
    value = match[2]&.strip || ''

    # Skip if no value or just whitespace
    return nil if value.empty? || value.match?(/^\s*$/)

    # Clean up the value (remove quotes)
    clean_value = value.gsub(/^["']|["']$/, '')
    [key, clean_value]
  end

  def add_keys_or_fallback(file, key, clean_value, full_keys)
    if full_keys.any?
      full_keys.each { |full_key| add_translation_key(file, full_key, clean_value) }
    else
      log "Warning: Could not find full key path for '#{key}' in #{file}, using fallback"
      add_translation_key(file, key, clean_value)
    end
  end

  def find_full_key_paths(hash, target_value, prefix = '')
    paths = []

    hash.each do |key, value|
      current_path = prefix.empty? ? key : "#{prefix}.#{key}"

      if value == target_value
        paths << current_path
      elsif value.is_a?(Hash)
        paths.concat(find_full_key_paths(value, target_value, current_path))
      end
    end

    paths
  end

  def add_translation_key(file, key, value)
    @all_new_keys << {
      file: file,
      key: key,
      value: value
    }
    log "Found new key: #{key} = #{value}"
  end

  def output_result
    if @all_new_keys.empty?
      log 'No new translation keys found'
      output_json([])
    else
      log "Found #{@all_new_keys.length} new translation keys"
      output_json(@all_new_keys)
    end
  end

  def output_json(data)
    puts JSON.generate(data)
  end

  def log(message)
    warn message
  end
end

# Main execution
if __FILE__ == $PROGRAM_NAME
  base_ref = ARGV[0] || 'develop'
  finder = TranslationKeyFinder.new(base_ref)
  finder.run
end
