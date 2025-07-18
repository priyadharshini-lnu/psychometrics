#!/usr/bin/env ruby
# frozen_string_literal: true

require 'English'
require 'json'

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

# Output to GitHub Actions
github_output = ENV.fetch('GITHUB_OUTPUT', nil)
if github_output
  File.open(github_output, 'a') { |f| f.puts "new_keys=#{new_keys_json.strip}" }
end

begin
  data = JSON.parse(new_keys_json)
  key_count = data.length

  puts "Found #{key_count} new translation keys"

  if key_count.positive?
    puts 'Keys found:'
    data.each { |item| puts "  - #{item['key']}" }
  end
rescue JSON::ParserError => e
  warn "Failed to parse JSON output: #{e.message}"
  puts 'Found 0 new translation keys'
end
