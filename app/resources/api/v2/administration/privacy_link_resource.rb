# frozen_string_literal: true

class Api::V2::Administration::PrivacyLinkResource < Api::V2::Administration::BaseResource
  attributes :text, :link

  has_one :project, class_name: 'Client'
end
