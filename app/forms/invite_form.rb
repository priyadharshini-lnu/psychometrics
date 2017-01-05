class InviteForm < BaseForm
  attr_accessor :emails
  validate :emails_format
  validates :emails, presence: true

  def parsed_emails
    emails.split(/\n+/)
  end

  def emails_format
    parsed_emails.each do |email|
      errors.add(:emails, 'Not valid email') unless !!(email =~ /.+@.+\..+/)
    end
  end
end
