#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'fileutils'
require 'open3'

class LocalTranslationFlow
  def initialize(base_ref = 'develop', pr_number = nil, head_ref = nil)
    @base_ref = base_ref
    @pr_number = pr_number
    @head_ref = head_ref
    @script_dir = File.dirname(__FILE__)
    @pr_created = false
    @pr_url = ''
    @translation_branch = ''
    @new_keys = []
  end

  def run
    log_header

    # Step 1: Find new translation keys
    new_keys = find_translation_keys
    return log_no_keys if new_keys.empty?

    # Step 2: Generate translations
    generate_translations(new_keys)

    # Step 3: Check if translations were generated
    return log_no_changes unless check_changes

    # Step 4: Create translation PR (optional, if PR details provided)
    create_translation_pr if should_create_pr?

    # Step 5: Show summary
    show_summary
  end

  private

  def log_header
    puts '🤖 Local Translation Bot'
    puts '=' * 50
    puts "Base ref: #{@base_ref}"
    puts "PR number: #{@pr_number || 'Not specified'}"
    puts "Head ref: #{@head_ref || 'Not specified'}"
    puts '=' * 50
    puts
  end

  def find_translation_keys
    puts '📋 Step 1: Finding new translation keys...'
    puts "Comparing against: #{@base_ref}"

    output, status = Open3.capture2("ruby #{@script_dir}/find-translation-keys.rb #{@base_ref}")

    unless status.success?
      puts '❌ Error finding translation keys'
      exit(1)
    end

    begin
      keys = JSON.parse(output)
      puts "✅ Found #{keys.length} new translation keys"
      keys.each do |key|
        puts "   - #{key['key']} (#{key['file']})"
      end
      puts
      keys
    rescue JSON::ParserError => e
      puts "❌ Error parsing translation keys: #{e.message}"
      exit(1)
    end
  end

  def log_no_keys
    puts 'ℹ️  No new translation keys found. Nothing to translate.'
    exit(0)
  end

  def generate_translations(keys)
    puts '🌐 Step 2: Generating translations...'
    keys_json = keys.to_json.gsub("'", "\\'")

    success = system("ruby #{@script_dir}/generate-translations.rb '#{keys_json}'")

    unless success
      puts '❌ Error generating translations'
      exit(1)
    end

    puts '✅ Translation generation completed'
    puts
  end

  def check_changes
    puts '🔍 Step 3: Checking for translation changes...'

    changes_file = 'translation_changes.txt'
    unless File.exist?(changes_file)
      puts '❌ Translation changes file not found'
      return false
    end

    changes_made = File.read(changes_file).strip == 'true'

    if changes_made
      puts '✅ Translation changes detected'
      show_git_status
    else
      puts 'ℹ️  No translation changes were made'
    end

    puts
    changes_made
  end

  def log_no_changes
    puts 'ℹ️  No translation changes were made. Exiting.'
    exit(0)
  end

  def show_git_status
    puts '   Git status:'
    system("git status --porcelain config/locales/ | grep -v '^??' | head -10 | sed 's/^/   /' || echo '   No files modified'")
  end

  def should_create_pr?
    @pr_number && @head_ref && ENV.fetch('GH_TOKEN', nil)
  end

  def create_translation_pr
    puts '📝 Step 4: Creating translation pull request...'

    base_ref_for_pr = @base_ref
    success = system("bash #{@script_dir}/create-translation-pr.sh #{@pr_number} #{@head_ref} #{base_ref_for_pr}")

    if success
      puts '✅ Translation PR creation completed'
    else
      puts '❌ Error creating translation PR'
    end
    puts
  end

  def show_summary
    puts '📊 Summary:'
    puts '- Translation keys processed: ✅'
    puts '- Translations generated: ✅'
    puts '- Files modified: ✅'

    if should_create_pr?
      puts '- PR created: ✅'
    else
      puts '- PR creation: ⏭️  Skipped (missing PR details or GH_TOKEN)'
    end

    puts
    puts '🎉 Local translation flow completed successfully!'
    puts
    puts 'Next steps:'
    puts '1. Review the generated translations in config/locales/'
    puts "2. Commit the changes: git add config/locales/ && git commit -m 'Add translations'"

    if should_create_pr?
      puts '3. Check the created PR for review'
    else
      puts "3. Push changes: git push origin #{@head_ref || 'your-branch'}"
    end
  end

  def log(message)
    puts message
  end
end

# Usage and argument parsing
if __FILE__ == $PROGRAM_NAME
  # Parse command line arguments
  base_ref = ARGV[0] || 'develop'
  pr_number = ARGV[1]
  head_ref = ARGV[2]

  # Show usage if requested
  if ARGV.include?('--help') || ARGV.include?('-h')
    puts "Usage: #{File.basename($0)} [BASE_REF] [PR_NUMBER] [HEAD_REF]"
    puts
    puts 'Arguments:'
    puts '  BASE_REF   Base branch to compare against (default: develop)'
    puts '  PR_NUMBER  Pull request number (optional, for PR creation)'
    puts '  HEAD_REF   Head reference/branch (optional, for PR creation)'
    puts
    puts 'Environment variables:'
    puts '  DEEPL_AUTH_KEY  DeepL API key for translations'
    puts '  GH_TOKEN        GitHub token for PR creation (optional)'
    puts
    puts 'Examples:'
    puts "  #{File.basename($0)}                           # Find and translate keys against develop"
    puts "  #{File.basename($0)} main                      # Compare against main branch"
    puts "  #{File.basename($0)} develop 123 feature-x     # Full workflow with PR creation"
    exit(0)
  end

  # Validate required environment variables
  unless ENV['DEEPL_AUTH_KEY']
    puts '❌ Error: DEEPL_AUTH_KEY environment variable is required'
    puts "Please set your DeepL API key: export DEEPL_AUTH_KEY='your-api-key'"
    exit(1)
  end

  # Run the flow
  flow = LocalTranslationFlow.new(base_ref, pr_number, head_ref)
  flow.run
end
