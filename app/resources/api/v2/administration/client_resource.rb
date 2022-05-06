# frozen_string_literal: true

class Api::V2::Administration::ClientResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :year, :number, :country

  has_one :account_manager
  has_one :project_manager

  def self.sortable_fields(context)
    super + [:"account_manager.first_name"]
  end

  def meta(_)
    {
      a: 100
    }
  end
end
