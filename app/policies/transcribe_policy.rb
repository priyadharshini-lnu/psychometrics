# frozen_string_literal: true

class TranscribePolicy < BasePolicy
  def pre_sign_url?
    true
  end
end
