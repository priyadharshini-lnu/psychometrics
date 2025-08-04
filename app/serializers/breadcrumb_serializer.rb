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
      name: object['campaign'].name,
      tags: generate_campaign_tags(object['campaign'])
    }
  end

  def threesixty
    {
      id: object['threesixty'].id,
      name: object['threesixty'].name
    }
  end

  private

  def generate_campaign_tags(campaign)
    tags = []
    tags << 'template' if campaign.template?
    tags
  end
end
