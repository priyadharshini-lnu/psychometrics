# frozen_string_literal: true

# The model is used for STI (Single Table Inheritance)
class AI::AssistedUserSession < ApplicationRecord
  self.table_name = 'ai_assisted_user_sessions'

  belongs_to :user
  belongs_to :assistable, polymorphic: true
  belongs_to :ai_assistant_chat, class_name: 'AI::AssistantChat'

  has_many :messages, class_name: 'AI::AssistantRequest', through: :ai_assistant_chat

  enum :status, { default: 0, in_progress: 1, completed: 2, failed: 3 }

  validates :user, presence: true
  validates :assistable, presence: true
  validates :ai_assistant_chat, presence: true

  def mark_as_completed!(checkpoint = nil)
    update!(status: :completed, checkpoint: checkpoint, error: nil, meta: nil)
  end

  def mark_as_failed!(error_message = nil, meta: nil)
    attributes = { status: :failed, error: error_message }
    attributes[:meta] = meta if meta
    update!(attributes)
  end

  def mark_as_in_progress!
    update!(status: :in_progress)
  end
end
