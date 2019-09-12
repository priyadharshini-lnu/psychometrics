# frozen_string_literal: true

class MembershipGrant < ApplicationRecord
  belongs_to :membership

  def has_grant?(scope, grant)
    return false if data.nil?

    !!data[scope.to_s]&.index(grant.to_s)
  end
end
