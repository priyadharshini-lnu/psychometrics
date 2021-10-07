# frozen_string_literal: true

module Administration
  module Memberships
    class WithGrantsSerializer < BaseSerializer
      has_one :grants, serializer: MembershipGrantsSerializer
    end
  end
end
