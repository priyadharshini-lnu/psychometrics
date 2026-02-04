#!/usr/bin/env ruby
# frozen_string_literal: true

# Check if translation changes were made by checking git status
github_output = ENV.fetch('GITHUB_OUTPUT', nil)

# Check if there are any changes in locale files using git
changed_files = `git status --porcelain config/locales/`.strip

if !changed_files.empty?
  # Output for GitHub Actions
  if github_output
    File.open(github_output, 'a') { |f| f.puts 'changes_made=true' }
  end
  puts 'Translation files were generated'
  puts "Changed files:\n#{changed_files}"
else
  # Output for GitHub Actions
  if github_output
    File.open(github_output, 'a') { |f| f.puts 'changes_made=false' }
  end
  puts 'No translation files were generated'
end
