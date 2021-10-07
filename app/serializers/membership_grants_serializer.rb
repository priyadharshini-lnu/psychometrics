# frozen_string_literal: true

class MembershipGrantsSerializer < ActiveModel::Serializer
  attributes :id, :membership_id, :data
end
