# frozen_string_literal: true

class PsyJsonbSerializer
  def self.dump(hash)
    hash
  end

  def self.load(hash)
    ActiveSupport::HashWithIndifferentAccess.new(hash.is_a?(String) ? JSON.parse(hash) : hash)
  end
end
