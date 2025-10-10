# frozen_string_literal: true

FactoryBot.define do
  factory :idp_setting do
    manager_approves_idp { false }
    manager_can_edit_idp { false }
  end
end
