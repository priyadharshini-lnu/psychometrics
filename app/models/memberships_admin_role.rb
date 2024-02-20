# frozen_string_literal: true

class MembershipsAdminRole < ApplicationRecord
  audited

  belongs_to :membership
  belongs_to :admin_role
end
