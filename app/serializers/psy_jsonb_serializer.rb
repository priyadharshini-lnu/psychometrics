# frozen_string_literal: true

class PsyJsonbSerializer < ActiveModel::Serializer
  def self.dump(hash)
    hash
  end

  def self.load(hash)
    HashWithIndifferentAccess.new(hash.is_a?(String) ? JSON.parse(hash) : hash)
  end
end
