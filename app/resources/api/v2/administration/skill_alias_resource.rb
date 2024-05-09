# frozen_string_literal: true

class Api::V2::Administration::SkillAliasResource < Api::V2::Administration::BaseResource
  attributes :name, :skill_id, :client_id

  has_one :client
  has_one :skill

  def skill_id
    @model.skill_id.to_s
  end

  def client_id
    @model.client_id.to_s
  end

  before_create do
    @model.client_id = context[:params][:client_id]
  end
end
