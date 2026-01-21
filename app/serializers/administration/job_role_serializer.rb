# frozen_string_literal: true

module Administration
  class JobRoleSerializer < Panko::Serializer
    attributes :id, :name, :code
  end
end
