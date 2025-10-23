# frozen_string_literal: true

# STI model for AI-assisted document summarization sessions.
# Uses ActiveStorage::Attachment as assistable to reference files with context.
#
class AI::AssistedUserDocumentSummary < AI::AssistedUserSession
  alias_attribute :summary, :checkpoint

  validates :assistable_type, inclusion: { in: ['ActiveStorage::Attachment'] }

  before_save :set_content_checksum

  def attachment
    assistable
  end

  def file
    attachment&.blob
  end

  def filename
    file&.filename&.to_s
  end

  def content_type
    file&.content_type
  end

  private

  def set_content_checksum
    self.content_checksum = file&.checksum
  end
end
