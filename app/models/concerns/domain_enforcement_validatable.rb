# frozen_string_literal: true

module DomainEnforcementValidatable
  extend ActiveSupport::Concern

  DOMAIN_PATTERN = /\A(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+\z/i

  included do
    validate :validate_domain_patterns, if: :enforce_for_specific_domains?
  end

  def sso_enforced_for_email?(email)
    return false unless saml_login_allowed?
    return true if enforce_for_all?
    return false unless enforce_for_specific_domains? && email.present?

    domain = email.split('@').last.to_s.downcase
    enforced_domains.any? do |pattern|
      pattern = pattern.downcase
      if pattern.start_with?('*.')
        domain.end_with?(".#{pattern[2..]}")
      else
        domain == pattern
      end
    end
  end

  private

  def validate_domain_patterns
    enforced_domains.each do |pattern|
      unless pattern.match?(DOMAIN_PATTERN)
        errors.add(:enforced_domains, :invalid_pattern, pattern: pattern)
      end
    end
  end
end
