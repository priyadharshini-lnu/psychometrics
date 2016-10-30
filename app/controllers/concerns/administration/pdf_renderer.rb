module Administration
  class PdfRenderer
    def initialize(resource, context, user_token = nil)
      @context = context
      @resource = resource
      @user_token = user_token
    end

    def render(opts = {})
      tmp_folder = Rails.root.join('tmp/reports')
      output = "#{tmp_folder}#{@resource.id}_#{Time.now.to_f}.pdf"

      args = {
        url: @context.url_for({ action: :preview, id: @resource, export: true, user_token: @user_token }),
        output: output,
        pageWidth: 850,
        pageHeight: 1100
      }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

      Dir.mkdir(tmp_folder) unless Dir.exist?(tmp_folder)
      
      system("phantomjs #{Rails.root.join('lib/raster.js')} #{args}")

      output
    end
  end
end
