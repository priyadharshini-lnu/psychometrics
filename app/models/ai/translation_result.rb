# frozen_string_literal: true

class AI::TranslationResult < ApplicationRecord
  belongs_to :translatable, polymorphic: true
  belongs_to :assistant_chat
end
