# frozen_string_literal: true

class LibraryDecorator < BaseDecorator
  def icon
    case object.type
      when 'folder'
        'fa fa-folder-o'
      when 'audio'
        'fa fa-file-audio-o'
      when 'video'
        'fa fa-file-video-o'
      else
        'fa fa-file-o'
    end
  end

  def delete_confirmation
    {
      title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.title", name: display_name),
      body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.delete.body", name: display_name)
    }.to_json
  end
end
