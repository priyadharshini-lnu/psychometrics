# frozen_string_literal: true

module MailerHelper
  def administration_to_admin_url(path)
    path.gsub('/administration/', '/admin/')
  end
end
