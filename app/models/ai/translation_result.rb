# frozen_string_literal: true

class AI::TranslationResult < ApplicationRecord
  belongs_to :translatable, polymorphic: true
  include Tenantable

  tenant_source :translatable

  belongs_to :assistant_chat
end
