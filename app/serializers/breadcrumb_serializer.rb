# frozen_string_literal: true

class BreadcrumbSerializer < Panko::Serializer
  attributes :client, :project, :campaign, :threesixty

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

  def threesixty
    {
      id: object['threesixty'].id,
      name: object['threesixty'].name
    }
  end
end
