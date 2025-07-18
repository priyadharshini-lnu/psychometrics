#!/usr/bin/env ruby
# frozen_string_literal: true

# Check if translation changes were made
changes_file = 'translation_changes.txt'

github_output = ENV.fetch('GITHUB_OUTPUT', nil)
if File.exist?(changes_file) && File.read(changes_file).strip == 'true'
  # Output for GitHub Actions
  if github_output
    File.open(github_output, 'a') { |f| f.puts 'changes_made=true' }
  end
  puts 'Placeholder translation files were generated'
else
  # Output for GitHub Actions
  if github_output
    File.open(github_output, 'a') { |f| f.puts 'changes_made=false' }
  end
  puts 'No translation files were generated'
end
