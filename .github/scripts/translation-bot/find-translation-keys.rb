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

    # Get current (new) content
    new_content = load_yaml_content(file)
    return if new_content.empty?

    # Get old content from base branch
    old_content = load_yaml_content_from_base(file)

    # Find keys that exist in new but not in old
    find_new_keys(file, old_content, new_content)
  end

  def load_yaml_content_from_base(file)
    # Get file content from base branch
    output, status = Open3.capture2("git show origin/#{@base_ref}:#{file} 2>/dev/null")
    return {} unless status.success?

    yaml_content = YAML.safe_load(output, permitted_classes: [Symbol])
    yaml_content&.dig('en') || {}
  rescue StandardError => e
    log "Note: Could not load #{file} from base branch (might be new file): #{e.message}"
    {}
  end

  def find_new_keys(file, old_hash, new_hash, prefix = '')
    new_hash.each do |key, value|
      current_path = prefix.empty? ? key.to_s : "#{prefix}.#{key}"

      if value.is_a?(Hash)
        old_value = old_hash.is_a?(Hash) ? old_hash[key] : nil
        find_new_keys(file, old_value || {}, value, current_path)
      else
        # It's a leaf value - check if it's new or changed
        old_value = old_hash.is_a?(Hash) ? old_hash[key] : nil
        if old_value.nil?
          # This is a new key
          add_translation_key(file, current_path, value.to_s)
        end
      end
    end
  end

  def load_yaml_content(file)
    yaml_content = YAML.load_file(file)
    yaml_content['en'] || {}
  rescue StandardError => e
    log "Warning: Could not parse YAML file #{file}: #{e.message}"
    {}
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
