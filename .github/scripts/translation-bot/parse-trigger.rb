#!/usr/bin/env ruby
# frozen_string_literal: true

# Parse the workflow trigger and extract translation arguments
#
# Usage: parse-trigger.rb <event_name> <comment_body> <issue_number> <pr_number>
#
# Outputs (via GITHUB_OUTPUT):
#   pr_number  - The PR number to process
#   languages  - Language args for i18n-tasks (e.g., "-l ar,fr" or empty for all)

def parse_issue_comment(comment_body, issue_number)
  languages = comment_body.match(%r{/translate\s+([\w,-]+)})&.[](1)

  if languages
    puts "→ Translating specific languages: #{languages}"
    write_output('languages', "-l #{languages}")
  else
    puts '→ Translating all languages'
    write_output('languages', '')
  end

  write_output('pr_number', issue_number)
end

def parse_label_trigger(pr_number)
  # Empty languages = translate to all locales except base_locale (en)
  puts '→ Label trigger: Translating all languages (except English)'
  write_output('languages', '')
  write_output('pr_number', pr_number)
end

def write_output(key, value)
  github_output = ENV.fetch('GITHUB_OUTPUT', nil)
  return unless github_output

  File.open(github_output, 'a') { |f| f.puts "#{key}=#{value}" }
end

def main
  event_name = ARGV[0]
  comment_body = ARGV[1] || ''
  issue_number = ARGV[2] || ''
  pr_number = ARGV[3] || ''

  if event_name == 'issue_comment'
    parse_issue_comment(comment_body, issue_number)
  else
    parse_label_trigger(pr_number)
  end
end

main
