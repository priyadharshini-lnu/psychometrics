# frozen_string_literal: true

class AssessmentsClient < ApplicationRecord
  audited

  belongs_to :assessment
  belongs_to :client, inverse_of: :assessments_clients
  include Tenantable

  acts_as_list scope: :client

  def toggle_universal_links!(enable = false)
    update!(enable_universal_links: enable)
  end

  def generate_universal_link!(options = {})
    update!(
      assessment_key: generate_random_key(*options.values),
      key_generated_at: Time.zone.now
    )
  end

  def expired?
    Time.zone.now > key_expires_at.to_i
  end

  def has_valid_universal_link?
    assessment_key.present? && !expired?
  end

  private

  def generate_random_key(length = 16, with_padding = false)
    SecureRandom.urlsafe_base64(length, with_padding)
  end
end
