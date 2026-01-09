#!/usr/bin/env ruby
# frozen_string_literal: true

# Get branch information for a PR
#
# Usage: get-branch-info.rb <pr_number>
#
# Outputs (via GITHUB_OUTPUT):
#   head_ref - The PR's head branch name
#   head_sha - The PR's head commit SHA
#   base_ref - The PR's base branch name

def write_output(key, value)
  github_output = ENV.fetch("GITHUB_OUTPUT", nil)
  return unless github_output

  File.open(github_output, "a") { |f| f.puts "#{key}=#{value}" }
end

def main
  pr_number = ARGV[0]

  head_ref = `git rev-parse --abbrev-ref HEAD`.strip
  head_sha = `git rev-parse HEAD`.strip
  base_ref = `gh pr view #{pr_number} --json baseRefName --jq '.baseRefName'`.strip

  write_output("head_ref", head_ref)
  write_output("head_sha", head_sha)
  write_output("base_ref", base_ref)

  puts "→ PR ##{pr_number}: #{head_ref} → #{base_ref}"
end

main
