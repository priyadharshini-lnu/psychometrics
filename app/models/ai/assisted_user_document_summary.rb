# frozen_string_literal: true

# STI model for AI-assisted document summarization sessions.
# Uses ActiveStorage::Blob as assistable to directly reference specific files.
#
class AI::AssistedUserDocumentSummary < AI::AssistedUserSession
  alias_attribute :summary, :checkpoint

  validates :assistable_type, inclusion: { in: ['ActiveStorage::Blob'] }

  before_save :set_content_checksum

  def file
    assistable
  end

  def filename
    file&.filename&.to_s
  end

  def content_type
    file&.content_type
  end

  private

  def set_content_checksum
    self.content_checksum = file.checksum
  end
end
