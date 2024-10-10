# frozen_string_literal: true

class Api::V2::Administration::WorkshopInviteResource < Api::V2::Administration::BaseResource
  attributes :title, :description, :created_at, :subjects_count, :allowed_languages, :allow_language_preference,
             :allow_neurodiversity_option, :subjects, :translations, :workshop_ids, :campaign_id

  has_many :workshops, exclude_links: :default
  has_many :workshop_invited_subjects

  audit_log_for :remove_to_many_relationships, payload: '*'
  audit_log_for :create_to_many_relationships, payload: '*'
  audit_log_for :destroy, payload: ->(_, workshop_invite) { workshop_invite.slice('id', 'title', 'description') }

  def fetchable_fields
    super - %i[subjects translations workshop_ids]
  end

  def self.creatable_fields(context)
    super - %i[title description subjects_count] + %i[subjects translations]
  end

  def subjects_count
    workshop_invited_subjects.count
  end

  ransack_filters %i[campaign_id_eq title_cont]
end
