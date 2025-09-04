# frozen_string_literal: true

# The model is used for STI (Single Table Inheritance)
class AI::AssistedUserSession < ApplicationRecord
  self.table_name = 'ai_assisted_user_sessions'

  belongs_to :user
  belongs_to :assistable, polymorphic: true
  belongs_to :ai_assistant_chat, class_name: 'AI::AssistantChat'

  enum :status, { default: 0, in_progress: 1, completed: 2, failed: 3 }

  validates :user, presence: true
  validates :assistable, presence: true
  validates :ai_assistant_chat, presence: true

  def mark_as_completed!
    update!(status: :completed)
  end

  def mark_as_failed!(error_message = nil)
    update!(status: :failed, error: error_message)
  end

  def mark_as_in_progress!
    update!(status: :in_progress)
  end
end
