# frozen_string_literal: true

module Utility
  class SanitizeHtml
    include ActionView::Helpers::SanitizeHelper

    # List of tags and attributes are copied from https://github.com/cure53/DOMPurify

    ALLOWED_TAGS = %w[
      a abbr acronym address area article aside audio b bdi bdo big blink blockquote body br button canvas caption
      center cite code col colgroup content data datalist dd decorator del details dfn dialog dir div dl dt element
      em fieldset figcaption figure font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i img input ins kbd
      label legend li main map mark marquee menu menuitem meter nav nobr ol optgroup option output p picture pre
      progress q rp rt ruby s samp section select shadow small source spacer span strike strong style sub summary
      sup table tbody td template textarea tfoot th thead time tr track tt u ul var video wbr svg altglyph
      altglyphdef altglyphitem animatecolor animatemotion animatetransform circle clippath defs desc ellipse filter
      font g glyph glyphref hkern image line lineargradient marker mask metadata mpath path pattern polygon polyline
      radialgradient rect stop style switch symbol text textpath title tref tspan view vkernmath menclose merror
      mfenced mfrac mi mlabeledtr mmultiscripts mn mo mover mpadded mphantom mroot mrow ms mspace msqrt mstyle
      msub msup msubsup mtable mtd mtext mtr munder munderover feBlend feColorMatrix feComponentTransfer feComposite
      feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR
      feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight
      feTile feTurbulence
    ].freeze

    ALLOWED_ATTRIBUTES = %w[
      accept action align alt autocapitalize autocomplete autopictureinpicture autoplay background bgcolor border
      capture cellpadding cellspacing checked cite class clear color cols colspan controls controlslist coords
      crossorigin datetime decoding default dir disabled disablepictureinpicture disableremoteplayback download
      draggable enctype enterkeyhint face for headers height hidden high href hreflang id inputmode integrity
      ismap kind label lang list loading loop low max maxlength media method min minlength multiple muted name
      nonce noshade novalidate nowrap open optimum pattern placeholder playsinline poster preload pubdate radiogroup
      readonly rel required rev reversed role rows rowspan spellcheck scope selected shape size sizes span srclang
      start src srcset step style summary tabindex title translate type usemap valign value width xmlns slot
      accent-height accumulate additive alignment-baseline ascent attributename attributetype azimuth basefrequency
      baseline-shift begin bias by class clip clippathunits clip-path clip-rule color color-interpolation
      color-interpolation-filters color-profile color-rendering cx cy d dx dy diffuseconstant direction display
      divisor dur edgemode elevation end fill fill-opacity fill-rule filter filterunits flood-color flood-opacity
      font-family font-size font-size-adjust font-stretch font-style font-variant font-weight fx fy g1 g2 glyph-name
      glyphref gradientunits gradienttransform height href id image-rendering in in2 k k1 k2 k3 k4 kerning keypoints
      keysplines keytimes lang lengthadjust letter-spacing kernelmatrix kernelunitlength lighting-color local
      marker-end marker-mid marker-start markerheight markerunits markerwidth maskcontentunits maskunits max mask
      media method mode min name numoctaves offset operator opacity order orient orientation origin overflow
      paint-order path pathlength patterncontentunits patterntransform patternunits points preservealpha
      preserveaspectratio primitiveunits r rx ry radius refx refy repeatcount repeatdur restart result rotate scale
      seed shape-rendering specularconstant specularexponent spreadmethod startoffset stddeviation stitchtiles
      stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit
      stroke-opacity stroke stroke-width style surfacescale systemlanguage tabindex targetx targety transform
      transform-origin text-anchor text-decoration text-rendering textlength type u1 u2 unicode values viewbox
      visibility version vert-adv-y vert-origin-x vert-origin-y width word-spacing wrap writing-mode xchannelselector
      ychannelselector x x1 x2 xmlns y y1 y2 z zoomandpan accent accentunder align bevelled close columnsalign
      columnlines columnspan denomalign depth dir display displaystyle encoding fence frame height href id largeop
      length linethickness lspace lquote mathbackground mathcolor mathsize mathvariant maxsize minsize movablelimits
      notation numalign open rowalign rowlines rowspacing rowspan rspace rquote scriptlevel scriptminsize
      scriptsizemultiplier selection separator separators stretchy subscriptshift supscriptshift symmetric
      voffset width xmlns
    ].freeze

    def self.process(html)
      new.sanitize(html, tags: ALLOWED_TAGS.dup, attributes: ALLOWED_ATTRIBUTES.dup)
    end
  end
end
