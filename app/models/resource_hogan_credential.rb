# frozen_string_literal: true

class ResourceHoganCredential < ApplicationRecord
  belongs_to :hogan_credential
  belongs_to :resource, polymorphic: true
end
