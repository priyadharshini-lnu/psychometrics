# frozen_string_literal: true

class IdpTemplateInterviewQuestion < ApplicationRecord
  belongs_to :idp_template
  belongs_to :interview_question

  include Tenantable

  tenant_source :idp_template
end
