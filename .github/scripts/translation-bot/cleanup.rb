#!/usr/bin/env ruby
# frozen_string_literal: true

# Clean up temporary files
files_to_clean = ['translation_changes.txt']

files_to_clean.each do |file|
  if File.exist?(file)
    File.delete(file)
    puts "Deleted #{file}"
  end
end

puts 'Cleanup completed'
