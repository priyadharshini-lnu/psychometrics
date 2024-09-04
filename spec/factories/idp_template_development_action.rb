# frozen_string_literal: true

FactoryBot.define do
  factory :idp_template_development_action do
    idp_template
    development_action
    category { IdpTemplateDevelopmentAction.categories.keys.sample }
  end
end
