# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpSkill, type: :model do
  context 'on destroy' do
    it 'destroys associated user_idp_development_actions' do
      user_idp_skill = create(:user_idp_skill)
      create(:user_idp_development_action, user_idp_skill: user_idp_skill)

      expect { user_idp_skill.destroy }.to change(UserIdpDevelopmentAction, :count).by(-1)
    end
  end
end
