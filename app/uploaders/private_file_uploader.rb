# frozen_string_literal: true

class PrivateFileUploader < FileUploader
  def fog_public
    false
  end

  def fog_authenticated_url_expiration
    10.minutes
  end
end
