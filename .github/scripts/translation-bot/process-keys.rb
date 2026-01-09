#!/usr/bin/env ruby
# frozen_string_literal: true

require 'English'
require 'json'

NEW_KEYS_FILE = '/tmp/new_keys.json'

base_ref = ARGV[0]

if base_ref.nil?
  warn "Usage: #{$PROGRAM_NAME} <BASE_REF>"
  exit 1
end

# Find new translation keys
new_keys_json = `ruby .github/scripts/translation-bot/find-translation-keys.rb "#{base_ref}"`
exit_status = $CHILD_STATUS.exitstatus

if exit_status != 0
  warn 'Failed to find translation keys'
  exit 1
end

# Write keys to a file to avoid "Argument list too long" error in subsequent steps
File.write(NEW_KEYS_FILE, new_keys_json.strip)

# Output file path and has_keys flag to GitHub Actions (small values only)
github_output = ENV.fetch('GITHUB_OUTPUT', nil)
if github_output
  File.open(github_output, 'a') do |f|
    f.puts "new_keys_file=#{NEW_KEYS_FILE}"
  end
end

begin
  data = JSON.parse(new_keys_json)
  key_count = data.length

  # Output whether we have keys (boolean is small and safe)
  if github_output
    File.open(github_output, 'a') do |f|
      f.puts "has_new_keys=#{key_count.positive?}"
      f.puts "new_keys_count=#{key_count}"
    end
  end

  puts "Found #{key_count} new translation keys"
  puts "Keys written to: #{NEW_KEYS_FILE}"

  if key_count.positive?
    puts 'Keys found:'
    data.each { |item| puts "  - #{item['key']}" }
  end
rescue JSON::ParserError => e
  warn "Failed to parse JSON output: #{e.message}"
  puts 'Found 0 new translation keys'
  # Write empty array to file
  File.write(NEW_KEYS_FILE, '[]')
  if github_output
    File.open(github_output, 'a') do |f|
      f.puts 'has_new_keys=false'
      f.puts 'new_keys_count=0'
    end
  end
end
