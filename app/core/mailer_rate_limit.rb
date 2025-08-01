# frozen_string_literal: true

# Determines the Sidekiq-Throttled limits that should apply to a mail delivery
# job. If the project owns an SMTP setting we take the limits from there;
# otherwise we fall back to a shared "default" bucket (values come from
# Settings.smtp_default or ENV).
class MailerRateLimit
  class << self
    # @param args [Array] original mailer method arguments (excluding internal
    #   ActionMailer values such as mailer class/action/delivery method)
    # @return [Hash] throttling parameters understood by sidekiq_throttle
    def for(*args)
      project_id = extract_project_id(args)

      if project_id && (smtp = SmtpSetting.find_by(project_id: project_id))
        {
          key_suffix: project_id,
          concurrency_limit: smtp.concurrency_limit,
          rate_limit: smtp.rate_limit,
          rate_period: smtp.rate_limit_period.minutes
        }
      else
        defaults = Settings.smtp_default

        {
          key_suffix: 'default',
          concurrency_limit: defaults.concurrency_limit,
          rate_limit: defaults.rate_limit,
          rate_period: defaults.rate_limit_period.minutes
        }
      end
    end

    private

    # Extract project_id from job arguments
    def extract_project_id(args)
      return nil if args.blank?

      options = args.last.is_a?(Hash) ? args.last.symbolize_keys : {}

      # Check explicit project_id from .with(project_id: ...)
      explicit_project_id = options.dig(:params, 'project_id') || options[:project_id]
      return explicit_project_id if explicit_project_id.present?

      # Fallback: extract from GlobalID user objects
      extract_from_globalid_args(options[:args])
    end

    def extract_from_globalid_args(args)
      return nil unless args.is_a?(Array)

      args.each do |arg|
        next unless arg.is_a?(Hash) && arg['_aj_globalid']

        project_id = locate_and_extract_project_id(arg['_aj_globalid'])
        return project_id if project_id.present?
      end

      nil
    end

    def locate_and_extract_project_id(globalid_string)
      record = GlobalID::Locator.locate(globalid_string)
      record.project_id if record.respond_to?(:project_id)
    rescue StandardError
      # ignore lookup failures
      nil
    end
  end
end
