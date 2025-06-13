# frozen_string_literal: true

class IdpTemplateReflectionQuestion < ApplicationRecord
  belongs_to :idp_template
  belongs_to :reflection_question
end
