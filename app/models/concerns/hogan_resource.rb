# frozen_string_literal: true

module HoganResource
  extend ActiveSupport::Concern

  included do
    has_one :resource_hogan_credential, as: :resource, dependent: :destroy
    has_one :hogan_credential, through: :resource_hogan_credential
  end

  def attach_hogan_credential(hogan_credential)
    ResourceHoganCredential.find_or_initialize_by(
      resource_type: self.class.name,
      resource_id: id
    ).tap do |resource_hogan_credential|
      resource_hogan_credential.hogan_credential = hogan_credential
      resource_hogan_credential.save
    end
  end
end
