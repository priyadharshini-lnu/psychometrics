# frozen_string_literal: true

class UserReflectionQuestionAnswer < ApplicationRecord
  belongs_to :user_idp_plan
  belongs_to :reflection_question
  include Tenantable

  tenant_source :user_idp_plan
end
