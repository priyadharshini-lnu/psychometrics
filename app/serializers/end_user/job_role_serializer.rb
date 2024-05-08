# frozen_string_literal: true

module EndUser
  class JobRoleSerializer < Panko::Serializer
    attributes :id, :name
  end
end
