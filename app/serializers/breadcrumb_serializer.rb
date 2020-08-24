# frozen_string_literal: true

class BreadcrumbSerializer < ActiveModel::Serializer
  attribute :client, if: -> { instance_options[:fields].include?('client') }
  attribute :project, if: -> { instance_options[:fields].include?('project') }
  attribute :campaign, if: -> { instance_options[:fields].include?('campaign') }

  def client
    {
      id: object['client'].id,
      name: object['client'].name
    }
  end

  def project
    {
      id: object['project'].id,
      name: object['project'].name
    }
  end

  def campaign
    {
      id: object['campaign'].id,
      name: object['campaign'].name
    }
  end
end
