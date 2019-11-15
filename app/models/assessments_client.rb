# frozen_string_literal: true

class AssessmentsClient < ApplicationRecord
  belongs_to :assessment
  belongs_to :client, inverse_of: :assessments_clients

  acts_as_list scope: :client

  def toggle_universal_links!(enable = false)
    update!(enable_universal_links: enable)
  end

  def generate_universal_link!(options = {})
    update!(
      assessment_key: generate_random_key(*options.values),
      key_generated_at: Time.now,
      key_expires_at: 2.months.from_now
    )
  end

  def expired?
    Time.now > key_expires_at
  end

  def has_valid_universal_link?
    !assessment_key.blank? && !expired?
  end

  private

  def generate_random_key(length = 16, with_padding = false)
    SecureRandom.urlsafe_base64(length, with_padding)
  end
end
