# frozen_string_literal: true

class HoganLog < ApplicationRecord
  has_one :hogan_credential, foreign_key: :participant_id, primary_key: :participant_id

  include Tenantable

  tenant_source :hogan_credential
end
