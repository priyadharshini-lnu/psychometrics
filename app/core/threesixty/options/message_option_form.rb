# frozen_string_literal: true

module Threesixty
  module Options
    class MessageOptionForm < Rectify::Form
      attribute :subject_can_send_reminder, Boolean
      attribute :send_invite_to_new_evaluator, Boolean
    end
  end
end
