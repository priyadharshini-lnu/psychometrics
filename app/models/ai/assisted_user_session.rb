# frozen_string_literal: true

# The model is used for STI (Single Table Inheritance)
class AI::AssistedUserSession < ApplicationRecord
  self.table_name = 'ai_assisted_user_sessions'

  belongs_to :user
  belongs_to :assistable, polymorphic: true
  belongs_to :resource, polymorphic: true, optional: true
  include Tenantable

  tenant_source %i[resource assistable user]

  has_many :chats, class_name: 'AI::AssistantChat', foreign_key: 'ai_assisted_user_session_id', dependent: :destroy
  has_many :messages, class_name: 'AI::AssistantRequest', through: :chats

  enum :status, { default: 0, in_progress: 1, completed: 2, failed: 3 }

  validates :user, presence: true
  validates :assistable, presence: true

  def latest_chat
    chats.order(created_at: :desc, id: :desc).first
  end

  def total_input_tokens
    chats.sum(:input_tokens)
  end

  def total_output_tokens
    chats.sum(:output_tokens)
  end

  def total_tokens
    total_input_tokens + total_output_tokens
  end

  def mark_as_completed!(checkpoint = nil)
    update!(status: :completed, checkpoint: checkpoint, error: nil)
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
